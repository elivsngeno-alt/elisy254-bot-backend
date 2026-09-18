const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

async function askOpenAI(prompt) {
  if (!process.env.CHATGPT_API_KEY) return "NOT_CONNECTED";

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.CHATGPT_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI error:", data);
    return "ERROR";
  }

  return data.choices?.[0]?.message?.content || "NO_RESPONSE";
}

async function askGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) return "NOT_CONNECTED";

  const response = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini error:", data);
    return "ERROR";
  }

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "NO_RESPONSE"
  );
}

async function askClaude(prompt) {
  if (!process.env.CLAUDE_API_KEY) return "NOT_CONNECTED";

  const response = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Claude error:", data);
    return "ERROR";
  }

  return data.content?.[0]?.text || "NO_RESPONSE";
}

async function askDeepSeek(prompt) {
  if (!process.env.DEEPSEEK_API_KEY) return "NOT_CONNECTED";

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("DeepSeek error:", data);
    return "ERROR";
  }

  return data.choices?.[0]?.message?.content || "NO_RESPONSE";
}

async function getAIAnalysis() {
  const prompt = `
You are one component of a trading analysis system.

Analyze the market direction conceptually.

Return ONLY:
DIRECTION: BUY, SELL, or WAIT
CONFIDENCE: 0-100

Do not claim guaranteed profit.
`;

  const [chatgpt, gemini, claude, deepseek] =
    await Promise.all([
      askOpenAI(prompt),
      askGemini(prompt),
      askClaude(prompt),
      askDeepSeek(prompt)
    ]);

  return {
    status: "CONNECTED",
    models: {
      chatgpt,
      gemini,
      claude,
      deepseek
    }
  };
}

module.exports = {
  getAIAnalysis
};
