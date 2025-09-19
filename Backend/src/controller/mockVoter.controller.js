import MockVoter from "../model/mockVoterId.model.js";

export const verifyVoterID = async (req, res) => {
  try {
    const { voterId } = req.body;

    if (!voterId || typeof voterId !== "string") {
      return res.status(400).json({ status: "ERROR", message: "voterId required" });
    }

    const voter = await MockVoter.findOne({ voterId: voterId.trim() });
    if (!voter) return res.json({ status: "INVALID", voterId });

    return res.json({ status: "VALID", voterId: voter.voterId, name: voter.name });
  } catch (error) {
    console.error("verifyVoterID error:", error);
    return res.status(500).json({ status: "ERROR", message: "Internal server error" });
  }
};

export const addMockVoter = async (req, res) => {
  try {
    let { voterId, name } = req.body;

    if (!voterId || !name) {
      return res.status(400).json({ status: "ERROR", message: "voterId and name are required" });
    }

    voterId = String(voterId).trim().toUpperCase();
    name = String(name).trim();

    // Prevent duplicates
    const existing = await MockVoter.findOne({ voterId });
    if (existing) {
      return res.status(409).json({ status: "EXISTS", message: "Voter ID already exists", voter: existing });
    }

    const created = await MockVoter.create({ voterId, name });
    return res.status(201).json({ status: "CREATED", voter: created });
  } catch (error) {
    console.error("addMockVoter error:", error);
    return res.status(500).json({ status: "ERROR", message: "Internal server error" });
  }
};

export const addMockVotersBulk = async (req, res) => {
  try {
    const { voters } = req.body; // [{ voterId, name }, ...]
    if (!Array.isArray(voters) || voters.length === 0) {
      return res.status(400).json({ status: "ERROR", message: "voters array required" });
    }

    // Normalize and filter invalid
    const normalized = voters
      .map(v => ({
        voterId: String(v?.voterId || "").trim().toUpperCase(),
        name: String(v?.name || "").trim(),
      }))
      .filter(v => v.voterId && v.name);

    if (normalized.length === 0) {
      return res.status(400).json({ status: "ERROR", message: "No valid voters to insert" });
    }

    // Insert ignoring duplicates
    const result = await MockVoter.insertMany(normalized, { ordered: false }).catch(e => {
      // insertMany with ordered:false will continue on duplicates; we still want partial success
      if (e?.writeErrors) return { insertedCount: e.result?.result?.nInserted || 0 };
      throw e;
    });

    const insertedCount = result?.insertedCount ?? (Array.isArray(result) ? result.length : 0);
    return res.status(201).json({ status: "CREATED", inserted: insertedCount, total: normalized.length });
  } catch (error) {
    console.error("addMockVotersBulk error:", error);
    return res.status(500).json({ status: "ERROR", message: "Internal server error" });
  }
};