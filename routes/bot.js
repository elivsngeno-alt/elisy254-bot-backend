const express = require("express");

const router = express.Router();

let botRunning = false;

router.get("/status", (req, res) => {
  res.json({
    running: botRunning,
    mode: "AI_DIRECTION",
    lot: Number(process.env.DEFAULT_LOT || 0.01),
    maxOpenTrades: Number(process.env.MAX_OPEN_TRADES || 10),
    capitalProtection:
      process.env.CAPITAL_PROTECTION === "true"
  });
});

router.post("/start", (req, res) => {
  botRunning = true;

  res.json({
    success: true,
    running: true,
    message: "Bot start request accepted"
  });
});

router.post("/stop", (req, res) => {
  botRunning = false;

  res.json({
    success: true,
    running: false,
    message: "Bot stop request accepted"
  });
});

module.exports = router;
