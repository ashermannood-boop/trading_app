import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import history from "connect-history-api-fallback";
import connectToMongoDB from "./config/mongodb.js";
import startBot from "./bot/index.js";

// Routes //
import userRouter from "./routes/userRoutes.js";
import newsRouter from "./routes/newsRoutes.js";
import loanRouter from "./routes/loanRoutes.js";
import kycRouter from "./routes/kycRoutes.js";
import depositRouter from "./routes/depositRoutes.js";
import withdrawalRoute from "./routes/withdrawalRoutes.js";
import authRouter from "./routes/authRoute.js";
import tradeRouter from "./routes/tradeRoutes.js";
import conversionRouter from "./routes/conversionRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import expiredLoanRouter from "./routes/expiredLoanRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import depositAddressRouter from "./routes/depositAddressRoutes.js";
import stakingRouter from "./routes/stakingRoutes.js"; 

// Services & Cron Workers
import PriceFeedService from "./services/priceFeed.js";
import { orderProcessor } from "./services/orderProcessor.js";
import { startYieldCronJob } from "./cron/yieldWorker.js"; 
dotenv.config();
//startBot()

/* ---------- Database ---------- */
connectToMongoDB();

/* ---------- Start Staking Yield Worker ---------- */
startYieldCronJob(); // <--- Initializes 00:00 UTC daily payout scheduler

/* ---------- Path Fix (ESM) ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct absolute path to the frontend build
const clientDistPath = path.resolve(__dirname, "..", "client", "dist");
console.log("✅ Serving static files from:", clientDistPath);

/* ---------- App ---------- */
const app = express();

/* ---------- COOP / COEP Headers ---------- */
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

/* ---------- CORS ---------- */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://www.zaytrade.com",
  "https://zaytrade.com",
  "https://trading-app-fdzj.onrender.com",
  "https://trading-app1-t0su.onrender.com",
  
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------- Server & Socket ---------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});

/* ---------- Price Feed ---------- */
let priceFeedService;
try {
  priceFeedService = new PriceFeedService(io);
  global.priceFeedService = priceFeedService;
  app.set("priceFeedService", priceFeedService);

  // START CRON PROCESSOR HERE AFTER THE FEED IS RECOVERED
  orderProcessor.init(priceFeedService);
} catch (err) {
  console.error("PriceFeedService failed:", err);
}

/* ---------- API Routes ---------- */
app.use("/api/auth", authRouter);
app.use("/api/news", newsRouter);
app.use("/api/loans", loanRouter);
app.use("/api/kyc", kycRouter);
app.use("/api/deposits", depositRouter);
app.use("/api/withdrawals", withdrawalRoute);
app.use("/api/users", userRouter);
app.use("/api/trades", tradeRouter);
app.use("/api/conversions", conversionRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/expired-loans", expiredLoanRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/deposit-addresses", depositAddressRouter);
app.use("/api/staking", stakingRouter); 

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

/* ---------- Price APIs ---------- */
app.get("/api/prices", (req, res) => {
  if (!priceFeedService) return res.status(503).json({ message: "Service unavailable" });
  res.json(priceFeedService.getPrices());
});

app.get("/api/prices/:symbol", (req, res) => {
  const price = priceFeedService?.getPrice(req.params.symbol);
  if (!price) return res.status(404).json({ message: "Symbol not found" });
  res.json(price);
});

/* ---------- SPA / Static Handling ---------- */

// 1. Static files (images, js, css)
app.use(express.static(clientDistPath));

// 2. SPA History Fallback
app.use(
  history({
    verbose: false,
    rewrites: [{ from: /^\/api\/.*$/, to: (ctx) => ctx.parsedUrl.pathname }]
  })
);

// 3. Final Catch-all
app.get(/^((?!\/api).)*$/, (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      console.error("SendFile Error:", err.message);
      res.status(500).send("Build files not found in /app/client/dist");
    }
  });
});

/* ---------- Socket.IO ---------- */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

/* ---------- Shutdown ---------- */
const shutdown = () => {
  priceFeedService?.disconnect();
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* ---------- Listen ---------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is live and listening on port ${PORT}`);
});