import { ethers } from "ethers"
import { VotingABI } from "../contracts/ABI.js"
import {
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY,
  VITE_VOTING_CONTRACT_ADDRESS
} from "../constants.js"

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

const votingContractRead = new ethers.Contract(
  VITE_VOTING_CONTRACT_ADDRESS,
  VotingABI,
  provider
)

const votingContractWrite = new ethers.Contract(
  VITE_VOTING_CONTRACT_ADDRESS,
  VotingABI,
  wallet
)

const checkWhitelist = async (userWalletAddress) => {
  try {
    return await votingContractRead.checkWhitelist(userWalletAddress);
  } catch (err) {
    console.error("Error in checkWhitelist:", err);
    throw err;
  }
}

const whiteListVoter = async (userWalletAddress) => {
  try {
    return await votingContractWrite.whiteListVoter(userWalletAddress);
  } catch (err) {
    console.error("Error in whiteListVoter:", err);
    throw err;
  }
}

const isCandidate = async (candidateWallet) => {
  try {
    return await votingContractRead.isCandidate(candidateWallet);
  } catch (error) {
    console.error("Error in the isCandidate:", error);
  }
}

const registerCandidate = async (candidateWallet) => {
  try {
    return await votingContractWrite.registerCandidate(candidateWallet);
  } catch (err) {
    console.error("Error in registerCandidate:", err);
    throw err;
  }
}

const getAllCandidatesWithVotes = async () => {
  try {
    return await votingContractRead.getAllCandidatesWithVotes();
  } catch (err) {
    console.error("Error in getAllCandidatesWithVotes:", err);
    throw err;
  }
}

const vote = async (candidateWallet) => {
  try {
    return await votingContractWrite.vote(candidateWallet);
  } catch (err) {
    console.error("Error in vote:", err);
    throw err;
  }
}

const getCandidates = async () => {
  try {
    return await votingContractRead.getCandidates();
  } catch (err) {
    console.error("Error in getCandidates:", err);
    throw err;
  }
}

const getVotes = async () => {
  try {
    return await votingContractRead.getVotes();
  } catch (err) {
    console.error("Error in getVotes:", err);
    throw err;
  }
}

const startVoting = async () => {
  try {
    return await votingContractWrite.startVoting();
  } catch (err) {
    console.error("Error in startVoting:", err);
    throw err;
  }
}

const endVoting = async () => {
  try {
    return await votingContractWrite.endVoting();
  } catch (err) {
    console.error("Error in endVoting:", err);
    throw err;
  }
}

export default {
  checkWhitelist,
  whiteListVoter,
  isCandidate,
  registerCandidate,
  getAllCandidatesWithVotes,
  vote,
  getCandidates,
  getVotes,
  startVoting,
  endVoting
}
