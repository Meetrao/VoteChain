import mongoose from "mongoose";

const VotingSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "Election"
  },
  description: {
    type: String,
    default: "Election Description"
  },
  phase: {
    type: String,
    enum: ["pending", "registration", "voting", "result", "ended"],
    default: "pending"
  },
  startTime: {
    type: Date,
    required: true
  },
  blockchainElectionId: {
    type: Number,
    default: null
  }
}, { timestamps: true });

const Voting = mongoose.model("Voting", VotingSchema);
export default Voting;
