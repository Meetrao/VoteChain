import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js"
import candiadateRoutes from "./routes/candiadate.route.js"

const app = express();

app.use('/api/candidate', candiadateRoutes);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRoutes);

export default app;