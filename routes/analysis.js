const express = require("express");
const { getAIAnalysis } = require("../services/ai");

const router = express.Router();

router.get("/latest", async (req, res) => {
  try {
    const analysis = await getAIAnalysis();

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Analysis service error"
    });
  }
});

module.exports = router;
