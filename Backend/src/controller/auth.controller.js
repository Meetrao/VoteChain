import bcrypt from "bcrypt";
import User from "../model/user.model.js";
import { sendOTP, verifyOTP } from "../utils/otpUtils.js";
import jwtUtil from "../utils/jwt.js";
import { euclideanDistance } from "../utils/face-api.js";

import { NODE_ENV } from "../constants.js";
import { THRESHOLD } from "../constants.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, voter_id, phone_number, face_embedding, userWalletAddress } = req.body;
    if (!name || !email || !password || !voter_id || !phone_number || !face_embedding || !userWalletAddress) {
      return res.status(400).json({ message: "All fields are required, including face embedding and wallet address." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { voter_id }, { phone_number }] });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email, voter ID, or phone number already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      voter_id,
      phone_number,
      password: hashedPassword,
      face_embedding,
      userWalletAddress, // <-- Store wallet address
    });
    await user.save();

    // Generate JWT token
    const token = jwtUtil.generateAccessToken({ id: user._id, voter_id: user.voter_id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const createdUser = await User.findById(user._id).select("-password");
    return res.status(201).json({ message: "User registered successfully.", user: createdUser });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

export const faceLoginController = async (req, res) => {
  try {
    const { voter_id, face_embedding } = req.body;
    if (!voter_id || !face_embedding) {
      return res.status(400).json({ message: "Voter ID and Face embedding required" });
    }

    const existingUser = await User.findOne({ voter_id });
    if (!existingUser) {
      return res.status(404).json({ message: "Voter ID not found" });
    }

    const storedEmbedding = existingUser.face_embedding;
    const distance = euclideanDistance(face_embedding, storedEmbedding);
    console.log("Face distance:", distance);

    if (distance <= THRESHOLD) {
      const token = jwtUtil.generateAccessToken({ id: existingUser._id, voter_id: existingUser.voter_id });

      res.cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Login successful", user: { id: existingUser._id, voter_id: existingUser.voter_id } });
    } else {
      return res.status(401).json({ message: "Face does not match. Try again." });
    }

  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

export const passwordLogin = async (req, res) => {
  try {
    const { voter_id, password } = req.body;

    if (!voter_id || !password) {
      return res.status(400).json({ message: "voter_id and password are required." });
    }

    // Find user by voter_id
    const user = await User.findOne({ voter_id });
    if (!user) {
      return res.status(404).json({ message: "Voter ID not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token and set cookie
    const token = jwtUtil.generateAccessToken({ id: user._id, voter_id: user.voter_id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return user info (excluding password)
    const userInfo = await User.findById(user._id).select("-password");
    return res.status(200).json({ message: "Login successful", user: userInfo });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

export const requestOTPLogin = async (req, res) => {
  try {
    const { voter_id } = req.body;
    if (!voter_id) {
      return res.status(400).json({ message: "Voter ID is required" });
    }

    const user = await User.findOne({ voter_id });
    if (!user) {
      return res.status(404).json({ message: "Voter ID not found" });
    }

    const otpResult = await sendOTP(user.phone_number);
    if (!otpResult.success) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    return res.status(500).json({ message: "OTP request failed.", error: error.message });
  }
};

export const verifyOTPLogin = async (req, res) => {
  try {
    const { voter_id, otp } = req.body;
    if (!voter_id || !otp) {
      return res.status(400).json({ message: "Voter ID and OTP are required" });
    }

    const user = await User.findOne({ voter_id });
    if (!user) {
      return res.status(404).json({ message: "Voter ID not found." });
    }

    const otpResult = await verifyOTP({ phone_number: user.phone_number, otp });
    if (!otpResult.success) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    const token = jwtUtil.generateAccessToken({ id: user._id, voter_id: user.voter_id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userInfo = await User.findById(user._id).select("-password");
    return res.status(200).json({ message: "Login successful", user: userInfo });

  } catch (error) {
    res.status(500).json({ message: "OTP verification failed.", error: error.message });
  }
}

export const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "Strict",
    });
    return res.status(200).json({
      message: "Logout successfully"
    })
  } catch (error) {
    return res.status(500).json({
      error: error
    })
  }
}