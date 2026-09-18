/*
|--------------------------------------------------------------------------
| ELISY254 DOLLARS ZONE
| Built-in Technical Analysis Engine
|--------------------------------------------------------------------------
|
| This engine does NOT require paid AI APIs.
|
| It receives market data and produces:
| BUY / SELL / WAIT
|
|--------------------------------------------------------------------------
*/

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function analyzeMarket(data = {}) {

  const price = number(data.price);
  const emaFast = number(data.emaFast);
  const emaSlow = number(data.emaSlow);
  const rsi = number(data.rsi);
  const macd = number(data.macd);
  const signal = number(data.signal);
  const spread = number(data.spread);

  let buyScore = 0;
  let sellScore = 0;

  const reasons = [];

  /*
  |--------------------------------------------------------------------------
  | EMA TREND
  |--------------------------------------------------------------------------
  */

  if (price && emaFast && emaSlow) {

    if (price > emaFast && emaFast > emaSlow) {
      buyScore += 2;
      reasons.push("Bullish EMA trend");
    }

    if (price < emaFast && emaFast < emaSlow) {
      sellScore += 2;
      reasons.push("Bearish EMA trend");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RSI
  |--------------------------------------------------------------------------
  */

  if (rsi) {

    if (rsi >= 50 && rsi < 70) {
      buyScore += 1;
      reasons.push("RSI supports BUY");
    }

    if (rsi <= 50 && rsi > 30) {
      sellScore += 1;
      reasons.push("RSI supports SELL");
    }

    if (rsi >= 70) {
      reasons.push("RSI overbought");
    }

    if (rsi <= 30) {
      reasons.push("RSI oversold");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MACD
  |--------------------------------------------------------------------------
  */

  if (macd || signal) {

    if (macd > signal) {
      buyScore += 1;
      reasons.push("MACD bullish");
    }

    if (macd < signal) {
      sellScore += 1;
      reasons.push("MACD bearish");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SPREAD PROTECTION
  |--------------------------------------------------------------------------
  */

  const maxSpread = number(
    process.env.MAX_SPREAD,
    0
  );

  if (maxSpread > 0 && spread > maxSpread) {

    return {
      source: "ENGINE",
      direction: "WAIT",
      confidence: 0,
      buyScore,
      sellScore,
      reason: "Spread is above configured maximum",
      reasons
    };
  }

  /*
  |--------------------------------------------------------------------------
  | FINAL DECISION
  |--------------------------------------------------------------------------
  */

  let direction = "WAIT";

  if (buyScore >= 3 && buyScore > sellScore) {
    direction = "BUY";
  }

  if (sellScore >= 3 && sellScore > buyScore) {
    direction = "SELL";
  }

  const highestScore = Math.max(
    buyScore,
    sellScore
  );

  const confidence = Math.min(
    100,
    Math.round(
      (highestScore / 4) * 100
    )
  );

  return {
    source: "ENGINE",
    direction,
    confidence,
    buyScore,
    sellScore,
    reason:
      direction === "WAIT"
        ? "Signals are not strong enough"
        : `${direction} conditions detected`,
    reasons
  };
}

module.exports = {
  analyzeMarket
};
