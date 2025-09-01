import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT
export const MONGO_URI = process.env.MONGO_URI
export const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY
export const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN
export const NODE_ENV = process.env.NODE_ENV
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
export const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID
export const THRESHOLD = Number(process.env.THRESHOLD)
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECERT = process.env.CLOUDINARY_API_SECERT