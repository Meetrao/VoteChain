import express from "express";
import { onlyAdmin } from "../middleware/admin.middleware.js";
import authMiddleware from "../middleware/jwt.middleware.js";
import {
  createVoting,
  getElection,
  startVotingPhase,
  startResultPhase,
  endElection,
  castVote,
  getResults,
  listPastElectionsWithWinners,
  listAllElections,
  checkBlockchainStatus,
  endBlockchainElection,
  debugUser,
  debugBlockchainVotes
} from "../controller/voting.controller.js";

const router = express.Router();

router.post("/create", onlyAdmin, createVoting);
router.get("/getElection", getElection);
router.get("/all", listAllElections);
router.post("/start-voting", onlyAdmin, startVotingPhase);
router.post("/start-result", onlyAdmin, startResultPhase);
router.post("/end-election", onlyAdmin, endElection);
router.post("/vote", authMiddleware, castVote);
router.get("/results", getResults);
router.get("/past-elections", listPastElectionsWithWinners);
router.get("/blockchain-status", onlyAdmin, checkBlockchainStatus);
router.post("/end-blockchain-election", onlyAdmin, endBlockchainElection);
router.get("/debug-user", authMiddleware, debugUser);
router.get("/debug-blockchain-votes", onlyAdmin, debugBlockchainVotes);

export default router;