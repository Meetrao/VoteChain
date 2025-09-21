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


app.use(cors({
  origin: true, // reflect request origin
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