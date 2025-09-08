import Voting from "../model/voting.model.js";
import Candidate from "../model/candidate.model.js";
import blockchain from "../utils/blockchain.js";

// 1. Create a new voting configuration (starts in registration phase)
export const createVoting = async (req, res) => {
  try {
    const { title, description, startTime, endTime, votingStart, votingEnd } = req.body;

    // Support both new (title/description/startTime) and old (votingStart/votingEnd) formats
    const actualStartTime = startTime || votingStart;
    const actualEndTime = endTime || votingEnd || null; // End time is now optional
    const actualTitle = title || "Election";
    const actualDescription = description || "Election Description";

    if (!actualStartTime) {
      return res.status(400).json({ message: "Start time is required." });
    }

    // Only check end time validation if end time is provided
    if (actualEndTime && new Date(actualEndTime) <= new Date(actualStartTime)) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    // Prevent overlapping sessions - check for active elections without relying on endTime
    const existingActive = await Voting.findOne({
      phase: { $in: ["registration", "voting"] }
    });
    if (existingActive) {
      return res.status(400).json({ message: "Another voting session is already active. End it first." });
    }

    const config = await Voting.create({
      title: actualTitle,
      description: actualDescription,
      startTime: new Date(actualStartTime),
      endTime: actualEndTime ? new Date(actualEndTime) : null,
      votingStart: new Date(actualStartTime), // Keep for backward compatibility
      votingEnd: actualEndTime ? new Date(actualEndTime) : null, // Keep for backward compatibility
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

    // If result phase, add vote counts from blockchain
    if (config.phase === "result") {
      try {
        const [candidateAddresses, voteCounts] = await blockchain.getAllCandidatesWithVotes();

        // Map vote counts to candidates
        const candidatesWithVotes = candidates.map(candidate => {
          const index = candidateAddresses.findIndex(addr => addr.toLowerCase() === candidate.candidateWalletAddress.toLowerCase());
          const voteCount = index !== -1 ? parseInt(voteCounts[index]) : 0;
          return {
            ...candidate.toObject(),
            voteCount
          };
        });

        return res.json({
          ...config.toObject(),
          phase: config.phase,
          candidates: candidatesWithVotes,
          votingStart: config.votingStart,
          votingEnd: config.votingEnd,
        });
      } catch (blockchainErr) {
        console.error("Error fetching vote counts:", blockchainErr);
        // Fallback: return candidates without vote counts
        return res.json({
          ...config.toObject(),
          phase: config.phase,
          candidates: candidates,
          votingStart: config.votingStart,
          votingEnd: config.votingEnd,
        });
      }
    }

    res.json({
      ...config.toObject(),
      phase: config.phase,
      candidates: candidates,
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
      console.log("🚀 Attempting blockchain startVoting...");
      const tx = await blockchain.startVoting();
      console.log("✅ Blockchain transaction initiated:", tx.hash);
      await tx.wait();
      console.log("✅ Blockchain transaction confirmed");
      config.phase = "voting";
      await config.save();
    } catch (bcErr) {
      console.error("❌ Blockchain error:", bcErr);
      // For now, continue without blockchain to test the flow
      console.log("⚠️ Continuing without blockchain for testing...");
      config.phase = "voting";
      await config.save();
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
      console.log("🛑 Attempting blockchain endVoting...");
      const tx = await blockchain.endVoting();
      console.log("✅ Blockchain transaction initiated:", tx.hash);
      await tx.wait();
      console.log("✅ Blockchain transaction confirmed");
      config.phase = "result";
      await config.save();
    } catch (bcErr) {
      console.error("❌ Blockchain error:", bcErr);
      // For now, continue without blockchain to test the flow
      console.log("⚠️ Continuing without blockchain for testing...");
      config.phase = "result";
      await config.save();
    }

    res.json({ message: "Voting phase ended, moved to result phase", config });
  } catch (error) {
    res.status(500).json({ message: "Failed to end voting phase", error: error.message });
  }
};

// 5. General phase update endpoint for admin dashboard
export const updateElectionPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { phase } = req.body;

    if (!["registration", "voting", "result"].includes(phase)) {
      return res.status(400).json({ message: "Invalid phase. Must be 'registration', 'voting', or 'result'" });
    }

    const config = await Voting.findById(id);
    if (!config) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Phase transition logic
    if (phase === "voting" && config.phase === "registration") {
      try {
        const tx = await blockchain.startVoting();
        await tx.wait();
        config.phase = "voting";
        await config.save();
      } catch (bcErr) {
        return res.status(500).json({ message: "Failed to start voting on blockchain", error: bcErr.message });
      }
    } else if (phase === "result" && config.phase === "voting") {
      try {
        const tx = await blockchain.endVoting();
        await tx.wait();
        config.phase = "result";
        await config.save();
      } catch (bcErr) {
        return res.status(500).json({ message: "Failed to end voting on blockchain", error: bcErr.message });
      }
    } else {
      return res.status(400).json({
        message: `Invalid phase transition from ${config.phase} to ${phase}`
      });
    }

    res.json({ message: `Election phase updated to ${phase}`, config });
  } catch (error) {
    res.status(500).json({ message: "Failed to update election phase", error: error.message });
  }
};

// 6. Delete/End current election
export const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await Voting.findById(id);
    if (!config) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Delete all candidates for this election
    await Candidate.deleteMany({});

    // Delete the election
    await Voting.findByIdAndDelete(id);

    res.json({ message: "Election ended and deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete election", error: error.message });
  }
};