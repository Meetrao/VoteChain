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
    enum: ["registration", "voting", "result"],
    default: "registration"
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false, default: null },
  votingStart: { type: Date, required: true }, // Keep for backward compatibility
  votingEnd: { type: Date, required: false, default: null } // Keep for backward compatibility
}, { timestamps: true });

const Voting = mongoose.model("Voting", VotingSchema);
export default Voting;
