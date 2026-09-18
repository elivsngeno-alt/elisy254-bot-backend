require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const botRoutes = require("./routes/bot");
const analysisRoutes = require("./routes/analysis");
const tradeRoutes = require("./routes/trades");
const analysisModeRoutes = require("./routes/analysis-mode");

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());
app.use(express.json());


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    name: "ELISY254 DOLLARS ZONE",
    status: "online",
    message: "Backend is running"
  });
});


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/bot", botRoutes);

app.use("/api/analysis", analysisRoutes);

app.use("/api/trades", tradeRoutes);

app.use(
  "/api/analysis-mode",
  analysisModeRoutes
);


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl
  });
});


/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {

  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });

});


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `ELISY254 DOLLARS ZONE backend running on port ${PORT}`
  );

});
