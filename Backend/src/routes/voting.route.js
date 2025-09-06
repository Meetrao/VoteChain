import express from "express";
import {
  createVoting,
  getCurrentElection,
  startVotingPhase,
  endVotingPhase
} from "../controller/voting.controller.js";

const router = express.Router();

// Create a new voting session (registration phase)
router.post("/create", createVoting);

// Get current voting status and candidates
router.get("/active", getCurrentElection);

// Manually move to voting phase
router.post("/start", startVotingPhase);

// Manually move to result phase
router.post("/end", endVotingPhase);

export default router;