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
// Temporary permissive CORS middleware (reflect origin and handle preflight)
// This ensures responses always include Access-Control-Allow-Origin for testing.
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // short-circuit preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});


// CORS configuration: permissive mode can be enabled with ENABLE_PERMISSIVE_CORS=true
const ENABLE_PERMISSIVE_CORS = process.env.ENABLE_PERMISSIVE_CORS === 'true';

if (ENABLE_PERMISSIVE_CORS) {
  console.warn('CORS: permissive mode enabled — allowing all origins (for testing only)');
  app.use(cors({ origin: true, credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
} else {
  // Use explicit allowlist from CORS_ORIGIN
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [CORS_ORIGIN];
      const normalize = (u) => (typeof u === 'string' ? u.replace(/\/$/, '') : u);
      const normOrigin = normalize(origin);

      // Direct match
      if (allowed.map(normalize).includes(normOrigin)) return callback(null, true);

      // Try hostname match (ignore protocol)
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

      console.warn('CORS: rejecting origin:', origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }));
}

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