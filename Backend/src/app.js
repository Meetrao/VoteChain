import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import candiadateRoutes from "./routes/candiadate.route.js"

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use('/api/candidate', candiadateRoutes);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRoutes);

export default app;