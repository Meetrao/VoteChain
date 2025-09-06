import Candidate from "../model/candidate.model.js";
import Voting from "../model/Voting.model.js";
import uploadFile from "../utils/cloudinary.js";
import blockchain from "../utils/blockchain.js";

export const candidateRegister = async (req, res) => {
  try {
    const { name, party, slogan, candidateWalletAddress } = req.body;

    // Check if there's an active voting config in registration phase
    const activeVoting = await Voting.findOne().sort({ createdAt: -1 });
    if (!activeVoting || activeVoting.phase !== "registration") {
      return res.status(400).json({ message: "Candidate registration is not allowed. No active registration phase." });
    }

    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    console.log("req.headers['content-type']:", req.headers['content-type']);

    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required." });
    }

    // Prevent duplicate registration in DB
    const existingCandidate = await Candidate.findOne({ candidateWalletAddress });
    if (existingCandidate) {
      return res.status(400).json({ message: "Candidate already registered with this wallet address in database." });
    }

    const result = await uploadFile(req.file.path);
    const logoUrl = result.secure_url;

    const candidate = new Candidate({
      name,
      party,
      slogan,
      logo: logoUrl,
      candidateWalletAddress
    });

    // Prevent duplicate registration on blockchain
    const alreadyCandidate = await blockchain.isCandidate(candidate.candidateWalletAddress);
    if (alreadyCandidate) {
      return res.status(400).json({ message: "Candidate already registered on this wallet address on blockchain." });
    }

    const tx = await blockchain.registerCandidate(candidate.candidateWalletAddress);
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      return res.status(500).json({ message: "Failed to register candidate on blockchain" });
    }

    await candidate.save();
    res.status(201).json({
      message: "Candidate registered",
      candidate,
      txHash: receipt.transactionHash
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export default candidateRegister;