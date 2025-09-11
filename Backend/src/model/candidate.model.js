import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  party: {
    type: String,
    required: true
  },
  slogan: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  candidateWalletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voting",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending"
  }
}, {
  timestamps: true
});

candidateSchema.index({ candidateWalletAddress: 1, election: 1 }, { unique: true });

export default mongoose.model("Candidate", candidateSchema);
