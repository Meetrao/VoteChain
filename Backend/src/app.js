import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import candidateRoutes from "./routes/candiadate.route.js";
import votingRoutes from "./routes/voting.route.js"; 

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/voting', votingRoutes);

export default app;