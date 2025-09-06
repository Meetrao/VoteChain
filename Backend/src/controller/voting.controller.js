import Voting from "../model/Voting.model.js";
import Candidate from "../model/candidate.model.js";
import blockchain from "../utils/blockchain.js";

// 1. Create a new voting configuration (starts in registration phase)
export const createVoting = async (req, res) => {
  try {
    const { votingStart, votingEnd } = req.body;

    if (!votingStart || !votingEnd) {
      return res.status(400).json({ message: "Voting start and end times are required." });
    }

    if (new Date(votingEnd) <= new Date(votingStart)) {
      return res.status(400).json({ message: "Voting end time must be after start time." });
    }

    // Prevent overlapping sessions
    const existingActive = await Voting.findOne({
      phase: { $in: ["registration", "voting"] },
      votingEnd: { $gte: new Date() },
    });
    if (existingActive) {
      return res.status(400).json({ message: "Another voting session is already active. End it first." });
    }

    const config = await Voting.create({
      votingStart: new Date(votingStart),
      votingEnd: new Date(votingEnd),
      phase: "registration",
    });

    res.status(201).json({ message: "Voting created in registration phase", config });
  } catch (error) {
    res.status(500).json({ message: "Failed to create voting", error: error.message });
  }
};

// 2. Get current voting status (no auto-phase changes here)
export const getCurrentElection = async (req, res) => {
  try {
    const config = await Voting.findOne().sort({ createdAt: -1 });
    if (!config) {
      return res.json({ phase: "none", candidates: [] });
    }

    const candidates = await Candidate.find({}, "name party slogan logo candidateWalletAddress");

    res.json({
      phase: config.phase,
      candidates: config.phase === "result" ? [] : candidates,
      votingStart: config.votingStart,
      votingEnd: config.votingEnd,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch voting status", error: error.message });
  }
};

// 3. Manually move to voting phase
export const startVotingPhase = async (req, res) => {
  try {
    const config = await Voting.findOne().sort({ createdAt: -1 });
    if (!config || config.phase !== "registration") {
      return res.status(400).json({ message: "No registration phase available to start voting." });
    }

    try {
      const tx = await blockchain.startVoting();
      await tx.wait();
      config.phase = "voting";
      await config.save();
    } catch (bcErr) {
      return res.status(500).json({ message: "Failed to start voting on blockchain", error: bcErr.message });
    }

    res.json({ message: "Voting phase started", config });
  } catch (error) {
    res.status(500).json({ message: "Failed to start voting phase", error: error.message });
  }
};

// 4. Manually move to result phase
export const endVotingPhase = async (req, res) => {
  try {
    const config = await Voting.findOne().sort({ createdAt: -1 });
    if (!config || config.phase !== "voting") {
      return res.status(400).json({ message: "No active voting phase to end." });
    }

    try {
      const tx = await blockchain.endVoting();
      await tx.wait();
      config.phase = "result";
      await config.save();
    } catch (bcErr) {
      return res.status(500).json({ message: "Failed to end voting on blockchain", error: bcErr.message });
    }

    res.json({ message: "Voting phase ended, moved to result phase", config });
  } catch (error) {
    res.status(500).json({ message: "Failed to end voting phase", error: error.message });
  }
;}