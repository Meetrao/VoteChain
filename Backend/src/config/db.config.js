import mongoose from "mongoose";
import { MONGO_URI } from "../constants.js";

const connectDB = async () => {
  try {
    console.log("MONGO_URI:", MONGO_URI); // Debug line
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;