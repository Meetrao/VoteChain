import express from "express";
import { verifyVoterID, addMockVoter, addMockVotersBulk } from "../controller/mockVoter.controller.js";

const router = express.Router();

// Create single mock voter
router.post("/voter", addMockVoter);

// Create bulk mock voters
router.post("/voters/bulk", addMockVotersBulk);

// Verify voterId
router.post("/verify-voter", verifyVoterID);

export default router;