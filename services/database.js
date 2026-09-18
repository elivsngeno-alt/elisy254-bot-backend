async function saveTradeRequest(trade) {
  console.log("Trade request:", trade);

  return {
    saved: true,
    trade
  };
}

async function getBotState() {
  return {
    running: false
  };
}

module.exports = {
  saveTradeRequest,
  getBotState
};
