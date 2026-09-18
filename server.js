require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const botRoutes = require("./routes/bot");
const analysisRoutes = require("./routes/analysis");
const tradeRoutes = require("./routes/trades");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "ELISY254 DOLLARS ZONE",
    status: "online",
    message: "Backend is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/trades", tradeRoutes);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`ELISY254 backend running on port ${PORT}`);
});
