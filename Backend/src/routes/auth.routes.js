import express from "express";
import {
  register,
  passwordLogin,
  verifyOTPLogin,
  requestOTPLogin,
  faceLoginController
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login/face", faceLoginController);
router.post("/login/password", passwordLogin);
router.post("/login/otp/request", requestOTPLogin);
router.post("/login/otp/verify", verifyOTPLogin);

export default router;