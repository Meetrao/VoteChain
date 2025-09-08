import express from "express";
import {
  createVoting,
  getCurrentElection,
  startVotingPhase,
  endVotingPhase,
  updateElectionPhase,
  deleteElection
} from "../controller/voting.controller.js";

const router = express.Router();

// Create a new voting session (registration phase)
router.post("/create", createVoting);

// Get current voting status and candidates
router.get("/active", getCurrentElection);
router.get("/current", getCurrentElection); // Alias for admin dashboard

// Manually move to voting phase
router.post("/start", startVotingPhase);

// Manually move to result phase
router.post("/end", endVotingPhase);

// Update election phase (for admin dashboard)
router.put("/:id/phase", updateElectionPhase);

// Delete election and all associated candidates
router.delete("/:id", deleteElection);

export default router;