/*
|--------------------------------------------------------------------------
| ELISY254 DOLLARS ZONE
| Multi-AI Analysis Service
|--------------------------------------------------------------------------
|
| Environment variables required:
|
| CHATGPT_API_KEY
| GEMINI_API_KEY
| CLAUDE_API_KEY
| DEEPSEEK_API_KEY
|
| IMPORTANT:
| This file does NOT place trades.
| It only connects the AI providers and returns analysis.
|
|--------------------------------------------------------------------------
*/

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const CLAUDE_URL =
  "https://api.anthropic.com/v1/messages";

const DEEPSEEK_URL =
  "https://api.deepseek.com/chat/completions";


/*
|--------------------------------------------------------------------------
| Safe API caller
|--------------------------------------------------------------------------
*/

async function callProvider(name, url, options) {

  if (!options) {
    return {
      status: "NOT_CONNECTED",
      message: "API key is missing"
    };
  }

  try {

    const response = await fetch(url, options);

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        raw: text
      };
    }

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
          data?.error?.type ||
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


/*
|--------------------------------------------------------------------------
| OpenAI
|--------------------------------------------------------------------------
*/

async function askChatGPT(prompt) {

  if (!process.env.CHATGPT_API_KEY) {
    return {
      status: "NOT_CONNECTED",
      message: "CHATGPT_API_KEY is missing"
    };
  }

  return callProvider(
    "OpenAI",

    OPENAI_URL,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization":
          `Bearer ${process.env.CHATGPT_API_KEY}`
      },

      body: JSON.stringify({

        model: "gpt-5.4",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ],

        max_completion_tokens: 150

      })
    }
  );
}


/*
|--------------------------------------------------------------------------
| Gemini
|--------------------------------------------------------------------------
*/

async function askGemini(prompt) {

  if (!process.env.GEMINI_API_KEY) {
    return {
      status: "NOT_CONNECTED",
      message: "GEMINI_API_KEY is missing"
    };
  }

  const url =
    `${GEMINI_URL}?key=${encodeURIComponent(
      process.env.GEMINI_API_KEY
    )}`;

  return callProvider(
    "Gemini",

    url,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        contents: [
          {
            role: "user",

            parts: [
              {
                text: prompt
              }
            ]
          }
        ],

        generationConfig: {
          maxOutputTokens: 150
        }

      })
    }
  );
}


/*
|--------------------------------------------------------------------------
| Claude
|--------------------------------------------------------------------------
*/

async function askClaude(prompt) {

  if (!process.env.CLAUDE_API_KEY) {
    return {
      status: "NOT_CONNECTED",
      message: "CLAUDE_API_KEY is missing"
    };
  }

  return callProvider(
    "Claude",

    CLAUDE_URL,

    {
      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "x-api-key":
          process.env.CLAUDE_API_KEY,

        "anthropic-version":
          "2023-06-01"

      },

      body: JSON.stringify({

        model:
          "claude-haiku-4-5-20251001",

        max_tokens: 150,

        messages: [
          {
            role: "user",
            content: prompt
          }
        ]

      })
    }
  );
}


/*
|--------------------------------------------------------------------------
| DeepSeek
|--------------------------------------------------------------------------
*/

async function askDeepSeek(prompt) {

  if (!process.env.DEEPSEEK_API_KEY) {
    return {
      status: "NOT_CONNECTED",
      message: "DEEPSEEK_API_KEY is missing"
    };
  }

  return callProvider(
    "DeepSeek",

    DEEPSEEK_URL,

    {
      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        "Authorization":
          `Bearer ${process.env.DEEPSEEK_API_KEY}`

      },

      body: JSON.stringify({

        model:
          "deepseek-v4-flash",

        messages: [

          {
            role: "system",

            content:
              "You are an analysis component. Do not claim guaranteed profits."
          },

          {
            role: "user",

            content: prompt
          }

        ],

        max_tokens: 150

      })
    }
  );
}


/*
|--------------------------------------------------------------------------
| Extract AI text
|--------------------------------------------------------------------------
*/

function extractText(provider, result) {

  if (!result || result.status !== "OK") {
    return null;
  }


  /*
  | OpenAI
  */

  if (provider === "chatgpt") {

    return (
      result.response
        ?.choices?.[0]
        ?.message
        ?.content ||
      null
    );
  }


  /*
  | Gemini
  */

  if (provider === "gemini") {

    return (
      result.response
        ?.candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text ||
      null
    );
  }


  /*
  | Claude
  */

  if (provider === "claude") {

    return (
      result.response
        ?.content?.[0]
        ?.text ||
      null
    );
  }


  /*
  | DeepSeek
  */

  if (provider === "deepseek") {

    return (
      result.response
        ?.choices?.[0]
        ?.message
        ?.content ||
      null
    );
  }


  return null;
}


/*
|--------------------------------------------------------------------------
| Main AI analysis
|--------------------------------------------------------------------------
*/

async function getAIAnalysis() {

  const prompt = `
You are an analysis component inside ELISY254 DOLLARS ZONE.

This is a connection test.

Return exactly:

STATUS: OK

Do not place trades.
Do not claim guaranteed profit.
`;


  /*
  | Run all four providers.
  */

  const results = await Promise.all([

    askChatGPT(prompt),

    askGemini(prompt),

    askClaude(prompt),

    askDeepSeek(prompt)

  ]);


  const chatgpt = results[0];
  const gemini = results[1];
  const claude = results[2];
  const deepseek = results[3];


  /*
  | Extract readable responses.
  */

  const responses = {

    chatgpt:
      extractText("chatgpt", chatgpt),

    gemini:
      extractText("gemini", gemini),

    claude:
      extractText("claude", claude),

    deepseek:
      extractText("deepseek", deepseek)

  };


  /*
  | Count connected providers.
  */

  const connected = results.filter(
    item => item.status === "OK"
  ).length;


  /*
  | Overall status.
  */

  let overallStatus = "WAITING";

  if (connected === 4) {

    overallStatus = "ALL_AI_CONNECTED";

  } else if (connected > 0) {

    overallStatus = "PARTIAL_AI_CONNECTION";

  } else {

    overallStatus = "NO_AI_CONNECTED";

  }


  return {

    status: overallStatus,

    connectedProviders: connected,

    totalProviders: 4,

    models: {

      chatgpt: {
        status: chatgpt.status,
        message:
          chatgpt.status === "OK"
            ? "Connected"
            : chatgpt.message,
        response:
          responses.chatgpt
      },

      gemini: {
        status: gemini.status,
        message:
          gemini.status === "OK"
            ? "Connected"
            : gemini.message,
        response:
          responses.gemini
      },

      claude: {
        status: claude.status,
        message:
          claude.status === "OK"
            ? "Connected"
            : claude.message,
        response:
          responses.claude
      },

      deepseek: {
        status: deepseek.status,
        message:
          deepseek.status === "OK"
            ? "Connected"
            : deepseek.message,
        response:
          responses.deepseek
      }

    },

    message:
      `${connected}/4 AI providers connected.`
  };
}


module.exports = {
  getAIAnalysis
};
