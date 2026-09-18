const express = require("express");

const router = express.Router();

router.post("/enter-key", (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({
      success: false,
      message: "Key is required"
    });
  }

  if (key !== process.env.BOT_OPEN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid key"
    });
  }

  res.json({
    success: true,
    message: "Access granted",
    token: "SESSION_PLACEHOLDER"
  });
});

module.exports = router;
