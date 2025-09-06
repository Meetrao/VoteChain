import mongoose from "mongoose";

const VotingSchema = new mongoose.Schema({
  phase: {
    type: String,
    enum: ["registration", "voting", "result"],
    default: "registration"
  },
  votingStart: { type: Date, required: true },
  votingEnd: { type: Date, required: true }
}, { timestamps: true });

const Voting = mongoose.model("Voting", VotingSchema);
export default Voting;
