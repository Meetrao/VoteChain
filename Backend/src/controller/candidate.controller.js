import Candidate from "../model/candidate.model.js";
import Voting from "../model/voting.model.js";
import { uploadFile, deleteFile } from "../utils/cloudinary.js";
import blockchain from "../utils/blockchain.js";

export const candidateRegister = async (req, res) => {
  try {
    const { name, party, slogan, candidateWalletAddress } = req.body;
    const wallet = candidateWalletAddress.toLowerCase();

    const activeVoting = await Voting.findOne({ 
      phase: { $ne: "ended" } 
    }).sort({ createdAt: -1 });

    if (!activeVoting || activeVoting.phase !== "registration") {
      return res.status(400).json({ 
        message: "No active registration phase." 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required." });
    }

    const existingCandidate = await Candidate.findOne({
      candidateWalletAddress: wallet,
      election: activeVoting._id,
    });
    if (existingCandidate) {
      return res.status(400).json({ 
        message: "Candidate already registered for this election." 
      });
    }

    const currentElectionId = await blockchain.getCurrentElectionId();
    const alreadyCandidate = await blockchain.isCandidate(currentElectionId, wallet);
    if (alreadyCandidate) {
      return res.status(400).json({ 
        message: "Candidate already registered on blockchain." 
      });
    }

    const result = await uploadFile(req.file.path);
    const logoUrl = result.secure_url;
    const publicId = result.public_id;

    let candidate = new Candidate({
      name,
      party,
      slogan,
      logo: logoUrl,
      candidateWalletAddress: wallet,
      election: activeVoting._id,
      status: "pending",
    });
    await candidate.save();

    try {
      const tx = await blockchain.registerCandidate(wallet);
      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        await Candidate.findByIdAndDelete(candidate._id);
        await deleteFile(publicId);
        return res.status(500).json({ message: "Blockchain registration failed" });
      }

      candidate.status = "confirmed";
      await candidate.save();

      return res.status(201).json({
        message: "✅ Candidate registered successfully",
        candidate: { 
          ...candidate.toObject(), 
          txHash: receipt.transactionHash 
        },
      });
    } catch (err) {
      await Candidate.findByIdAndDelete(candidate._id);
      await deleteFile(publicId);
      return res.status(500).json({ 
        message: "Blockchain registration error", 
        error: err.message 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      message: "Registration failed", 
      error: error.message 
    });
  }
};

export const listCandidates = async (req, res) => {
  try {
    const { electionId } = req.query;

    let targetElection;

    if (electionId) {
      targetElection = await Voting.findById(electionId);
      if (!targetElection) {
        return res.status(404).json({ message: "Election not found" });
      }
    } else {
      targetElection = await Voting.findOne({ 
        phase: { $ne: "ended" } 
      }).sort({ createdAt: -1 });
      
      if (!targetElection) {
        return res.status(404).json({ message: "No active election found" });
      }
    }

    const candidates = await Candidate.find(
      { election: targetElection._id, status: "confirmed" },
      "name party slogan logo candidateWalletAddress"
    );

    return res.json({
      candidates,
      election: {
        id: targetElection._id,
        title: targetElection.title,
        phase: targetElection.phase
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch candidates", 
      error: error.message 
    });
  }
};

export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Voting.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const candidates = await Candidate.find(
      { election: electionId, status: "confirmed" },
      "name party slogan logo candidateWalletAddress"
    );

    return res.json({
      candidates,
      election: {
        id: election._id,
        title: election.title,
        phase: election.phase
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch candidates", 
      error: error.message 
    });
  }
};

export const checkCandidateStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get current active election
    const activeVoting = await Voting.findOne({
      phase: { $ne: "ended" }
    }).sort({ createdAt: -1 });

    if (!activeVoting) {
      return res.json({ 
        dbStatus: "no_active_election", 
        blockchainStatus: null 
      });
    }

    // Find candidate for current election only
    const candidate = await Candidate.findOne({
      candidateWalletAddress: walletAddress.toLowerCase(),
      election: activeVoting._id
    });

    console.log("Database candidate:", candidate);

    if (!candidate) {
      return res.json({ 
        dbStatus: "not_found", 
        blockchainStatus: null 
      });
    }

    // 🔧 FIX: Check blockchain using getCurrentElectionId
    let isOnBlockchain = false;
    try {
      const currentElectionId = await blockchain.getCurrentElectionId();
      isOnBlockchain = await blockchain.isCandidate(currentElectionId, walletAddress);
    } catch (error) {
      console.error("Blockchain check failed:", error);
      isOnBlockchain = false;
    }

    return res.json({
      dbStatus: candidate.status,
      blockchainStatus: isOnBlockchain ? "registered" : "not_registered",
      candidate: {
        name: candidate.name,
        party: candidate.party,
        walletAddress: candidate.candidateWalletAddress
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};