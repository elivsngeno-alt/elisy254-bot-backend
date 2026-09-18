async function callAI(name, url, options) {
  if (!options) {
    return {
      status: "NOT_CONNECTED",
      message: "API key is missing"
    };
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(`${name} API ERROR`, {
        status: response.status,
        data
      });

      return {
        status: "ERROR",
        httpStatus: response.status,
        message:
          data?.error?.message ||
          data?.message ||
          "API request failed"
      };
    }

    return {
      status: "OK",
      response: data
    };

  } catch (error) {
    console.error(`${name} NETWORK ERROR`, error.message);

    return {
      status: "ERROR",
      message: error.message
    };
  }
}


async function getAIAnalysis() {

  const prompt = `
You are an AI market-analysis component.

For testing only, return:

DIRECTION: BUY, SELL, or WAIT
CONFIDENCE: 0-100

Do not claim guaranteed profit.
`;


  // CHATGPT / OPENAI
  const openai = await callAI(
    "OpenAI",
    "https://api.openai.com/v1/chat/completions",
    process.env.CHATGPT_API_KEY
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${process.env.CHATGPT_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-5.6-luna",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 100
          })
        }
      : null
  );


  // GEMINI
  const gemini = await callAI(
    "Gemini",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" +
      `?key=${process.env.GEMINI_API_KEY || ""}`,
    process.env.GEMINI_API_KEY
      ? {
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
      : null
  );


  // CLAUDE
  const claude = await callAI(
    "Claude",
    "https://api.anthropic.com/v1/messages",
    process.env.CLAUDE_API_KEY
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 100,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          })
        }
      : null
  );


  // DEEPSEEK
  const deepseek = await callAI(
    "DeepSeek",
    "https://api.deepseek.com/chat/completions",
    process.env.DEEPSEEK_API_KEY
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-flash",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 100
          })
        }
      : null
  );


  return {
    status: "AI_DIAGNOSTIC",
    models: {
      chatgpt: openai,
      gemini: gemini,
      claude: claude,
      deepseek: deepseek
    }
  };
}


module.exports = {
  getAIAnalysis
};
