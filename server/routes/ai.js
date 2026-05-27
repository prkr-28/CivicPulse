const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAMES = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

async function generateAIResponse(prompt, history = []) {
  let lastError;

  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      for (let retry = 0; retry < 3; retry++) {
        try {
          let result;

          if (history.length > 0) {
            const chat = model.startChat({
              history,
            });

            result = await chat.sendMessage(prompt);
          }

          else {
            result = await model.generateContent(prompt);
          }

          return result.response.text();
        } catch (err) {
          lastError = err;

          console.log(
            `⚠️ Retry ${retry + 1} failed for ${modelName}:`,
            err.message
          );

          if (
            err.message.includes('503') ||
            err.message.includes('overloaded') ||
            err.message.includes('high demand')
          ) {
            await new Promise((resolve) =>
              setTimeout(resolve, 2000 * (retry + 1))
            );

            continue;
          }

          throw err;
        }
      }
    } catch (err) {
      lastError = err;

      console.log(`❌ Model ${modelName} failed:`, err.message);
    }
  }

  throw lastError;
}

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    apiKeyPresent: !!process.env.GEMINI_API_KEY,
    models: MODEL_NAMES,
  });
});

router.get('/models', async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    console.log(
      '📨 Chat request received:',
      messages?.length || 0,
      'messages'
    );

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required',
      });
    }

    const cleanedMessages = messages.filter((msg, index) => {
      if (index === 0 && msg.role === 'assistant') {
        return false;
      }

      return true;
    });

    let formattedMessages = cleanedMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    while (
      formattedMessages.length > 0 &&
      formattedMessages[0].role !== 'user'
    ) {
      formattedMessages.shift();
    }

    if (formattedMessages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid user messages found',
      });
    }

    const systemPrompt = `
You are CivicPulse Support Assistant.

You help citizens use the CivicPulse platform in India.

You can answer questions about:
- Reporting civic issues
- Issue statuses
- Upvoting
- Notifications
- Admin review process
- Civic participation

If a question is unrelated, politely redirect them back to CivicPulse topics.

Keep responses:
- Friendly
- Helpful
- Concise
- Human-like

IMPORTANT: Do NOT use markdown formatting like **, *, __, _, ##, #. Use plain text only.
Use line breaks to separate points. Format lists with numbers (1. 2. 3.) or dashes (-).
`;

    const lastMessage =
      formattedMessages[formattedMessages.length - 1];

    const history = formattedMessages.slice(0, -1);

    const finalPrompt = `
${systemPrompt}

User:
${lastMessage.parts[0].text}
`;

    const responseText = await generateAIResponse(
      finalPrompt,
      history
    );

    console.log('✅ Chat response generated');

    return res.json({
      success: true,
      message: responseText,
    });
  } catch (error) {
    console.error('❌ Chatbot Error:', error);

    if (
      error.message?.includes('API key') ||
      error.message?.includes('invalid')
    ) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Gemini API Key',
      });
    }

    if (
      error.message?.includes('quota') ||
      error.message?.includes('429')
    ) {
      return res.status(429).json({
        success: false,
        error: 'Gemini quota exceeded',
      });
    }

    if (
      error.message?.includes('503') ||
      error.message?.includes('overloaded') ||
      error.message?.includes('high demand')
    ) {
      return res.status(503).json({
        success: false,
        error:
          'AI servers are busy right now. Please try again shortly.',
      });
    }

    return res.status(500).json({
      success: false,
      error:
        error.message || 'Failed to generate chatbot response',
    });
  }
});

router.post('/improve', async (req, res) => {
  try {
    const { description, category } = req.body;

    console.log('✏️ Improve request received');

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Description is required',
      });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Category is required',
      });
    }

    const prompt = `
You are helping a citizen write a professional civic issue report.

Category:
${category}

Original Description:
"${description}"

Instructions:
1. Make the report professional
2. Improve clarity
3. Mention urgency if relevant
4. Keep it concise
5. Use 2-4 sentences
6. Make it actionable for officers

IMPORTANT:
Return ONLY the improved description.
`;

    const improvedText = await generateAIResponse(prompt);

    console.log('✅ Description improved');

    return res.json({
      success: true,
      original: description,
      improved: improvedText.trim(),
    });
  } catch (error) {
    console.error('❌ Improver Error:', error);

    if (
      error.message?.includes('API key') ||
      error.message?.includes('invalid')
    ) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Gemini API Key',
      });
    }

    if (
      error.message?.includes('quota') ||
      error.message?.includes('429')
    ) {
      return res.status(429).json({
        success: false,
        error: 'Gemini quota exceeded',
      });
    }

    if (
      error.message?.includes('503') ||
      error.message?.includes('overloaded') ||
      error.message?.includes('high demand')
    ) {
      return res.status(503).json({
        success: false,
        error:
          'AI servers are busy right now. Please try again shortly.',
      });
    }

    return res.status(500).json({
      success: false,
      error:
        error.message || 'Failed to improve description',
    });
  }
});

router.post('/resolve-issue', async (req, res) => {
  try {
    const { message, issueDetails } = req.body;

    console.log('🔧 Issue resolution request received');

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    if (!issueDetails) {
      return res.status(400).json({
        success: false,
        error: 'Issue details are required',
      });
    }

    const systemPrompt = `
You are an expert civic infrastructure consultant helping administrators resolve reported issues efficiently.

You have access to the following issue details:
- Title: ${issueDetails.title}
- Description: ${issueDetails.description}
- Category: ${issueDetails.category}
- Status: ${issueDetails.status}
- Location: Latitude ${issueDetails.location.coordinates[1]}, Longitude ${issueDetails.location.coordinates[0]}
- Number of Photos: ${issueDetails.imageCount}
- Photos: ${issueDetails.images ? issueDetails.images.join(', ') : 'None'}

Your role:
1. Suggest practical, cost-effective solutions
2. Consider the issue category and severity
3. Provide step-by-step action plans
4. Estimate timeline for resolution
5. Suggest priority level
6. Recommend resource allocation
7. Consider safety and public impact

Keep responses:
- Professional
- Actionable
- Realistic
- Detailed

IMPORTANT: Do NOT use markdown formatting like **, *, __, _, ##, #. Use plain text only.
Use line breaks between points. Format lists with numbers (1. 2. 3.) or dashes (-).
`;

    const finalPrompt = `
${systemPrompt}

Admin's question:
"${message}"

Provide a detailed response with practical suggestions for resolving this issue.
`;

    const responseText = await generateAIResponse(finalPrompt);

    console.log('✅ Issue resolution plan generated');

    return res.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error('❌ Issue Resolution Error:', error);

    if (
      error.message?.includes('API key') ||
      error.message?.includes('invalid')
    ) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Gemini API Key',
      });
    }

    if (
      error.message?.includes('quota') ||
      error.message?.includes('429')
    ) {
      return res.status(429).json({
        success: false,
        error: 'AI quota exceeded. Please try again later.',
      });
    }

    if (
      error.message?.includes('503') ||
      error.message?.includes('overloaded') ||
      error.message?.includes('high demand')
    ) {
      return res.status(503).json({
        success: false,
        error:
          'AI servers are busy right now. Please try again shortly.',
      });
    }

    return res.status(500).json({
      success: false,
      error:
        error.message || 'Failed to generate resolution plan',
    });
  }
});

module.exports = router;