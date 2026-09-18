const express = require("express");

const {
  analyzeMarket
} = require("../services/engine");

const {
  getAIAnalysis
} = require("../services/ai");

const router = express.Router();


let analysisMode =
  process.env.DEFAULT_ANALYSIS_MODE || "ENGINE";


const allowedModes = [
  "ENGINE",
  "AI",
  "HYBRID"
];


/*
|--------------------------------------------------------------------------
| GET MODE
|--------------------------------------------------------------------------
*/

router.get("/mode", (req, res) => {

  res.json({
    success: true,
    mode: analysisMode,
    availableModes: allowedModes
  });

});


/*
|--------------------------------------------------------------------------
| SET MODE
|--------------------------------------------------------------------------
*/

router.post("/mode", (req, res) => {

  const mode =
    String(req.body.mode || "")
      .toUpperCase();

  if (!allowedModes.includes(mode)) {

    return res.status(400).json({
      success: false,
      message:
        "Mode must be ENGINE, AI, or HYBRID"
    });

  }

  analysisMode = mode;

  res.json({
    success: true,
    mode: analysisMode,
    message:
      `Analysis mode changed to ${analysisMode}`
  });

});


/*
|--------------------------------------------------------------------------
| ENGINE ANALYSIS
|--------------------------------------------------------------------------
*/

router.post("/engine", (req, res) => {

  const result =
    analyzeMarket(req.body || {});

  res.json({
    success: true,
    analysis: result
  });

});


/*
|--------------------------------------------------------------------------
| COMPLETE ANALYSIS
|--------------------------------------------------------------------------
*/

router.post("/run", async (req, res) => {

  try {

    /*
    |--------------------------------------------------------------------------
    | ENGINE MODE
    |--------------------------------------------------------------------------
    */

    if (analysisMode === "ENGINE") {

      const engine =
        analyzeMarket(req.body || {});

      return res.json({
        success: true,
        mode: "ENGINE",
        analysis: engine
      });

    }


    /*
    |--------------------------------------------------------------------------
    | AI MODE
    |--------------------------------------------------------------------------
    */

    if (analysisMode === "AI") {

      const ai =
        await getAIAnalysis();

      return res.json({
        success: true,
        mode: "AI",
        analysis: ai
      });

    }


    /*
    |--------------------------------------------------------------------------
    | HYBRID MODE
    |--------------------------------------------------------------------------
    */

    const engine =
      analyzeMarket(req.body || {});

    const ai =
      await getAIAnalysis();

    return res.json({
      success: true,
      mode: "HYBRID",
      analysis: {
        engine,
        ai
      }
    });

  } catch (error) {

    console.error(
      "Analysis mode error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Analysis failed"
    });

  }

});


module.exports = router;
