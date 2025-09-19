import mongoose from "mongoose";

const mockVoterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const MockVoter = mongoose.model("MockVoter", mockVoterSchema);
export default MockVoter;