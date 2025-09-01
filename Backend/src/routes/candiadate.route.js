import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { candidateRegister } from "../controller/candidate.controller.js";

const router = express.Router();

router.post("/register", upload.single("logo"), candidateRegister);

export default router;