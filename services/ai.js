async function getAIAnalysis() {
  return {
    status: "WAITING_FOR_AI",
    direction: "WAIT",
    confidence: 0,
    models: {
      chatgpt: "NOT_CONNECTED",
      gemini: "NOT_CONNECTED",
      claude: "NOT_CONNECTED",
      deepseek: "NOT_CONNECTED"
    },
    message:
      "AI engines will be connected through secure server-side API calls."
  };
}

module.exports = {
  getAIAnalysis
};
