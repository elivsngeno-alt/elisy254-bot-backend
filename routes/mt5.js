const express = require("express");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| MT5 Bridge State
|--------------------------------------------------------------------------
*/

let mt5 = {
  connected: false,
  lastHeartbeat: null,
  account: null,
  positions: [],
  lastSignal: null,
  emergencyStop: false
};


/*
|--------------------------------------------------------------------------
| MT5 Bridge Authentication
|--------------------------------------------------------------------------
*/

function authenticateBridge(req, res, next) {

  const expectedToken = process.env.MT5_BRIDGE_TOKEN;

  if (!expectedToken) {
    return res.status(503).json({
      success: false,
      message: "MT5 bridge token is not configured"
    });
  }

  const token = req.headers["x-mt5-token"];

  if (!token || token !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized MT5 bridge"
    });
  }

  next();
}


/*
|--------------------------------------------------------------------------
| Dashboard: MT5 Status
|--------------------------------------------------------------------------
|
| This endpoint is intentionally public for now so the Vercel
| dashboard can display connection status.
|
*/

router.get("/status", (req, res) => {

  const heartbeatAge =
    mt5.lastHeartbeat
      ? Date.now() - new Date(mt5.lastHeartbeat).getTime()
      : null;

  const connected =
    heartbeatAge !== null && heartbeatAge < 90000;

  mt5.connected = connected;

  res.json({
    success: true,
    connected: mt5.connected,
    status: mt5.connected ? "CONNECTED" : "OFFLINE",
    lastHeartbeat: mt5.lastHeartbeat,
    account: mt5.account,
    positions: mt5.positions,
    emergencyStop: mt5.emergencyStop
  });

});


/*
|--------------------------------------------------------------------------
| MT5 Heartbeat
|--------------------------------------------------------------------------
*/

router.post("/heartbeat", authenticateBridge, (req, res) => {

  mt5.connected = true;
  mt5.lastHeartbeat = new Date().toISOString();

  res.json({
    success: true,
    message: "MT5 heartbeat received",
    serverTime: mt5.lastHeartbeat
  });

});


/*
|--------------------------------------------------------------------------
| MT5 Account Information
|--------------------------------------------------------------------------
*/

router.post("/account", authenticateBridge, (req, res) => {

  mt5.account = {
    login: req.body.login || null,
    server: req.body.server || null,
    balance: Number(req.body.balance || 0),
    equity: Number(req.body.equity || 0),
    margin: Number(req.body.margin || 0),
    freeMargin: Number(req.body.freeMargin || 0),
    currency: req.body.currency || "USD",
    updatedAt: new Date().toISOString()
  };

  mt5.connected = true;
  mt5.lastHeartbeat = new Date().toISOString();

  res.json({
    success: true,
    message: "MT5 account updated",
    account: mt5.account
  });

});


/*
|--------------------------------------------------------------------------
| MT5 Positions
|--------------------------------------------------------------------------
*/

router.post("/positions", authenticateBridge, (req, res) => {

  if (!Array.isArray(req.body.positions)) {
    return res.status(400).json({
      success: false,
      message: "positions must be an array"
    });
  }

  mt5.positions = req.body.positions;

  mt5.connected = true;
  mt5.lastHeartbeat = new Date().toISOString();

  res.json({
    success: true,
    message: "MT5 positions updated",
    count: mt5.positions.length
  });

});


/*
|--------------------------------------------------------------------------
| Receive Trading Signal
|--------------------------------------------------------------------------
*/

router.post("/signal", authenticateBridge, (req, res) => {

  const {
    symbol,
    action,
    lot,
    stopLoss,
    takeProfit,
    source
  } = req.body;

  if (!symbol || !action) {
    return res.status(400).json({
      success: false,
      message: "symbol and action are required"
    });
  }

  mt5.lastSignal = {
    symbol,
    action,
    lot: Number(lot || 0),
    stopLoss: Number(stopLoss || 0),
    takeProfit: Number(takeProfit || 0),
    source: source || "ENGINE",
    receivedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: "Signal received",
    signal: mt5.lastSignal
  });

});


/*
|--------------------------------------------------------------------------
| Emergency Stop
|--------------------------------------------------------------------------
*/

router.post("/emergency-stop", authenticateBridge, (req, res) => {

  mt5.emergencyStop = true;

  res.json({
    success: true,
    emergencyStop: true,
    message: "Emergency trading stop enabled"
  });

});


/*
|--------------------------------------------------------------------------
| Clear Emergency Stop
|--------------------------------------------------------------------------
*/

router.post("/resume", authenticateBridge, (req, res) => {

  mt5.emergencyStop = false;

  res.json({
    success: true,
    emergencyStop: false,
    message: "Trading permission restored"
  });

});


module.exports = router;
