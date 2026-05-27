const Issue = require('../models/Issue');
const User = require('../models/User');

const createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    const imageUrls = req.files?.photos ? req.files.photos.map(file => file.path) : [];

    console.log('Create issue - Files received:', req.files?.photos?.length || 0);
    console.log('Create issue - ImageUrls:', imageUrls);

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location (latitude and longitude) is required' });
    }

    if (imageUrls.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 images allowed' });
    }

    const newIssue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      imageUrls,
      reportedBy: req.user.userId
    });

    await newIssue.save();

    await newIssue.populate('reportedBy', 'name email');

    res.status(201).json({
      message: 'Issue reported successfully',
      issue: newIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue: ' + error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const { category, status } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues: ' + error.message });
  }
};

const getNearbyIssues = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'Latitude, longitude, and radius are required' });
    }

    const radiusInMeters = parseFloat(radius) * 1000;

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Get nearby issues error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby issues: ' + error.message });
  }
};

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user.userId })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({ error: 'Failed to fetch your issues: ' + error.message });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('upvotes', 'name email');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to fetch issue: ' + error.message });
  }
};

const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const userId = req.user.userId;

    const hasUpvoted = issue.upvotes.includes(userId);

    if (hasUpvoted) {
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
    } else {
      issue.upvotes.push(userId);
    }

    await issue.save();

    await issue.populate('reportedBy', 'name email');

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Upvote added',
      upvoteCount: issue.upvotes.length,
      issue
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Failed to upvote issue: ' + error.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.reportedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own issues' });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue: ' + error.message });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getNearbyIssues,
  getMyIssues,
  getIssueById,
  upvoteIssue,
  deleteIssue
};
