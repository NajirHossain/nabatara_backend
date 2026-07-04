import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import pool from "./config/dbconnect.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authRouter, router } from "./routes/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// process.cwd() = backend/ in dev, public_html/ in production (Passenger)
const UPLOADS_DIR = process.env.NODE_ENV === "production"
  ? path.join(process.cwd(), "uploads")
  : path.join(process.cwd(), "src", "uploads");

// Ensure upload directories exist at startup
const UPLOAD_SUBDIRS = ["Products","Hero","Promo","Categories","Pages","Spotlight"];
for (const sub of UPLOAD_SUBDIRS) {
  const dir = path.join(UPLOADS_DIR, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

// Serve locally uploaded product images
app.use("/uploads", express.static(UPLOADS_DIR));

// Rate limiters — production only
if (process.env.NODE_ENV === "production") {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });
  const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP requests, please try again later." },
  });
  app.use("/auth/login",                 authLimiter);
  app.use("/auth/signup",                authLimiter);
  app.use("/auth/send-verification-otp", otpLimiter);
  app.use("/auth/send-reset-otp",        otpLimiter);
  app.use("/auth/reset-password",        otpLimiter);
}

app.use("/auth", authRouter);
app.use("/api/v1", router);

// Test DB connection on startup
pool.query("SELECT NOW()")
  .then((res) => console.log("Database connected at:", res.rows[0].now))
  .catch((err) => console.error("Database connection error:", err));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
