import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import candidateRoutes from "./routes/candidate.route.js";
import votingRoutes from "./routes/voting.route.js";
import mockVoterRoutes from "./routes/mockVoter.route.js";

import { CORS_ORIGIN } from "./constants.js";
import './utils/cronJobs.js';

const app = express();

// Middleware
// Configure CORS to allow only whitelisted origins (supports array)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    const allowed = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [CORS_ORIGIN];
    // Normalize origin (remove trailing slash)
    const normalize = (u) => (typeof u === 'string' ? u.replace(/\/$/, '') : u);
    const normOrigin = normalize(origin);

    // Direct match
    if (allowed.map(normalize).includes(normOrigin)) return callback(null, true);

    // Allow simple hostname match (ignore protocol)
    try {
      const url = new URL(normOrigin);
      const originHost = url.host;
      for (const a of allowed) {
        if (!a) continue;
        const allowedHost = normalize(a).replace(/^https?:\/\//, '');
        if (allowedHost === originHost || allowedHost === originHost.replace(/^www\./, '') || (`www.${allowedHost}` === originHost)) {
          return callback(null, true);
        }
      }
    } catch (e) {
      // ignore URL parse errors
    }

    // Not allowed — don't throw, just deny and let CORS middleware proceed (no header)
    console.warn('CORS: rejecting origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/voting", votingRoutes);
app.use("/api/mock", mockVoterRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Simple ping route for uptime checks (returns plain text)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

export default app;