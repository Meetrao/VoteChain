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
    required: false
  }
}, {
  timestamps: true
})

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;