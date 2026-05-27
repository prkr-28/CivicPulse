const Issue = require('../models/Issue');
const User = require('../models/User');
const { sendStatusUpdateEmail } = require('../utils/sendEmail');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_NAMES = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

const generateContentWithFallback = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let lastError;

  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✅ Success with model: ${modelName}`);
      return result;
    } catch (err) {
      if (err.status === 429 || err.status === 503) {
        const reason = err.status === 429 ? 'rate limited' : 'service unavailable';
        console.warn(`⚠️ ${modelName} ${reason} (${err.status}), trying next model...`);
        lastError = err;
      } else {
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini models exhausted');
};

const getAllIssuesForAdmin = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name email')
      .populate('upvotes', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Get all issues for admin error:', error);
    res.status(500).json({ error: 'Failed to fetch issues: ' + error.message });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!['open', 'in-progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const issue = await Issue.findById(req.params.id).populate('reportedBy');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const oldStatus = issue.status;
    issue.status = status;

    if (status === 'resolved' || status === 'rejected') {
      issue.priorityScore = 0;
      issue.priorityLevel = 'Low';
      issue.priorityReason = status === 'resolved' ? 'Issue resolved' : 'Issue rejected';
    }

    await issue.save();

    if (issue.reportedBy && issue.reportedBy.email) {
      const readableStatus =
        status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
      await sendStatusUpdateEmail(
        issue.reportedBy.email,
        issue.title,
        readableStatus
      );
    }

    res.json({
      message: `Issue status updated from ${oldStatus} to ${status}`,
      issue,
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Failed to update issue status: ' + error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const openCount = await Issue.countDocuments({ status: 'open' });
    const inProgressCount = await Issue.countDocuments({ status: 'in-progress' });
    const resolvedCount = await Issue.countDocuments({ status: 'resolved' });
    const rejectedCount = await Issue.countDocuments({ status: 'rejected' });

    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const citizenCount = await User.countDocuments({ role: 'citizen' });

    res.json({
      issues: {
        total: totalIssues,
        open: openCount,
        'in-progress': inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
      },
      users: {
        total: totalUsers,
        admin: adminCount,
        citizen: citizenCount,
      },
      resolutionRate:
        totalIssues > 0
          ? ((resolvedCount / totalIssues) * 100).toFixed(2) + '%'
          : '0%',
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics: ' + error.message });
  }
};

const calculatePriorities = async (req, res) => {
  try {
    const issues = await Issue.find({
      status: { $in: ['open', 'in-progress'] }
    }).populate('reportedBy', 'name email');

    if (issues.length === 0) {
      return res.json({
        message: 'No unresolved issues found to prioritize',
        count: 0,
        issues: [],
      });
    }

    const issuesData = issues.map((issue) => ({
      id: issue._id,
      title: issue.title,
      category: issue.category,
      status: issue.status,
      upvotes: issue.upvotes?.length || 0,
      daysOpen: Math.floor(
        (Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24)
      ),
      imageCount: issue.imageUrls?.length || 0,
      hasDescription: !!issue.description,
    }));

    const prompt = `
You are a civic infrastructure priority scoring system.

Analyze these UNRESOLVED issues (only open/in-progress) and assign priority scores and levels.
IMPORTANT: scores MUST be integers between 1 and 10 (inclusive). Never return 0 or negative values.

ISSUES TO ANALYZE:
${JSON.stringify(issuesData, null, 2)}

SCORING CRITERIA:
1. Category Impact (Safety issues = higher priority)
   - Streetlights/Open manholes/Fallen trees: +3 (safety risk)
   - Potholes/Water leakage/Garbage: +1-2 (minor impact)

2. Duration (how long unresolved)
   - 30+ days: +3
   - 14-29 days: +2
   - 7-13 days: +1

3. Community Support (upvotes indicate demand)
   - 10+ upvotes: +3
   - 5-9 upvotes: +2
   - 1-4 upvotes: +1

4. Current Status
   - Open (unstarted): +2
   - In-progress (active work): 0

5. Evidence Quality
   - 3+ photos: +1
   - 1-2 photos: 0
   - No photos: -1

PRIORITY LEVELS:
- Critical (8-10): Immediate safety risk or high community demand
- High (6-7): Significant impact, multiple upvotes, long unresolved
- Medium (4-5): Standard issues that need attention
- Low (1-3): Minor issues or already in progress

RESPOND IN THIS JSON FORMAT (no markdown, just JSON):
{
  "priorities": [
    {
      "id": "issue_id",
      "score": 8,
      "level": "Critical",
      "reason": "Safety risk - fallen tree blocking road, 5 days unresolved, 3 upvotes"
    }
  ]
}
`;

    const result = await generateContentWithFallback(prompt);
    const responseText = result.response.text();

    let priorityData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      priorityData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return res.status(500).json({
        error: 'Failed to parse priority scores from AI',
        details: responseText,
      });
    }

    const updatedIssues = [];
    for (const priority of priorityData.priorities) {
      const issue = issues.find((i) => i._id.toString() === priority.id);
      if (issue) {
        issue.priorityScore = Math.min(10, Math.max(1, Math.round(priority.score)));
        issue.priorityLevel = priority.level;
        issue.priorityReason = priority.reason;
        issue.priorityCalculatedAt = new Date();
        await issue.save();
        updatedIssues.push(issue);
      }
    }

    res.json({
      message: `Priority scores calculated for ${updatedIssues.length} issues`,
      count: updatedIssues.length,
      issues: updatedIssues.sort((a, b) => b.priorityScore - a.priorityScore),
    });
  } catch (error) {
    console.error('Calculate priorities error:', error);

    if (error.status === 429 || error.status === 503) {
      return res.status(503).json({
        error: 'All Gemini models are currently unavailable (rate limit or high demand). Please wait a minute and try again.',
      });
    }

    res.status(500).json({ error: 'Failed to calculate priorities: ' + error.message });
  }
};

module.exports = {
  getAllIssuesForAdmin,
  updateIssueStatus,
  getStats,
  calculatePriorities,
};