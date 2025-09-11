import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { candidateRegister, listCandidates, getCandidatesByElection, checkCandidateStatus } from "../controller/candidate.controller.js";

const router = express.Router();

router.post("/register", upload.single("logo"), candidateRegister);
router.get("/list", listCandidates);
router.get("/election/:electionId", getCandidatesByElection);
router.get("/check/:walletAddress", checkCandidateStatus);

export default router;