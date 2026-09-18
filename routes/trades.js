const express = require("express");

const router = express.Router();

router.post("/request", (req, res) => {
  const {
    symbol,
    direction,
    lot
  } = req.body;

  if (!symbol || !direction) {
    return res.status(400).json({
      success: false,
      message: "Symbol and direction are required"
    });
  }

  const allowedDirections = ["BUY", "SELL", "WAIT", "CLOSE"];

  if (!allowedDirections.includes(direction)) {
    return res.status(400).json({
      success: false,
      message: "Invalid trade direction"
    });
  }

  const requestedLot =
    Number(lot || process.env.DEFAULT_LOT || 0.01);

  res.json({
    success: true,
    request: {
      symbol,
      direction,
      lot: requestedLot,
      status: "PENDING_MT5_ENGINE"
    }
  });
});

router.post("/result", (req, res) => {
  res.json({
    success: true,
    received: true
  });
});

module.exports = router;
