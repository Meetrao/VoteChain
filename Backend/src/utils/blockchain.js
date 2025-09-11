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
);

const votingContractWrite = new ethers.Contract(
  VITE_VOTING_CONTRACT_ADDRESS,
  VotingABI,
  wallet
);

// --- Election Functions ---
const createElection = async () => {
  try {
    const tx = await votingContractWrite.createElection();
    const receipt = await tx.wait();
    
    // Get the new election ID from events or contract
    const currentElectionId = await votingContractRead.currentElectionId();
    
    return { 
      electionId: currentElectionId.toNumber ? currentElectionId.toNumber() : Number(currentElectionId),
      receipt 
    };
  } catch (error) {
    console.error("Error in createElection:", error);
    throw error;
  }
};

const endElection = async () => {
  try {
    return await votingContractWrite.endElection();
  } catch (error) {
    console.error("Error in endElection:", error);
    throw error;
  }
};

const getCurrentElectionId = async () => {
  try {
    const electionId = await votingContractRead.currentElectionId();
    return electionId.toNumber ? electionId.toNumber() : Number(electionId);
  } catch (error) {
    console.error("Error in getCurrentElectionId:", error);
    throw error;
  }
};

const isCurrentElectionActive = async () => {
  try {
    return await votingContractRead.isCurrentElectionActive();
  } catch (error) {
    console.error("Error in isCurrentElectionActive:", error);
    throw error;
  }
};

// --- Candidate Functions ---
const isCandidate = async (electionId, candidateWallet) => {
  try {
    return await votingContractRead.isCandidate(electionId, candidateWallet);
  } catch (error) {
    console.error("Error in isCandidate:", error);
    throw error;
  }
};

const registerCandidate = async (candidateWallet) => {
  try {
    return await votingContractWrite.registerCandidate(candidateWallet, { gasLimit: 500000 });
  } catch (error) {
    console.error("Error in registerCandidate:", error);
    throw error;
  }
};

// --- Voting Functions ---
const vote = async (candidateWallet) => {
  try {
    return await votingContractWrite.vote(candidateWallet);
  } catch (error) {
    console.error("Error in vote:", error);
    throw error;
  }
};

const hasVoted = async (electionId, voterWallet) => {
  try {
    return await votingContractRead.hasVoted(electionId, voterWallet);
  } catch (error) {
    console.error("Error in hasVoted:", error);
    throw error;
  }
};

// --- Data Retrieval Functions ---
const getCandidates = async (electionId) => {
  try {
    return await votingContractRead.getCandidates(electionId);
  } catch (error) {
    console.error("Error in getCandidates:", error);
    throw error;
  }
};

const getAllCandidatesWithVotes = async (electionId) => {
  try {
    const [candidates, votes] = await votingContractRead.getAllCandidatesWithVotes(electionId);
    return { 
      candidates, 
      votes: votes.map(v => v.toNumber ? v.toNumber() : Number(v))
    };
  } catch (error) {
    console.error("Error in getAllCandidatesWithVotes:", error);
    throw error;
  }
};

// --- Convenience Functions for Current Election ---
const getCurrentCandidates = async () => {
  try {
    return await votingContractRead.getCurrentCandidates();
  } catch (error) {
    console.error("Error in getCurrentCandidates:", error);
    throw error;
  }
};

const getCurrentCandidatesWithVotes = async () => {
  try {
    const [candidates, votes] = await votingContractRead.getCurrentCandidatesWithVotes();
    return { 
      candidates, 
      votes: votes.map(v => v.toNumber ? v.toNumber() : Number(v))
    };
  } catch (error) {
    console.error("Error in getCurrentCandidatesWithVotes:", error);
    throw error;
  }
};

// --- Whitelist Functions (if your contract has them) ---
const checkWhitelist = async (userWalletAddress) => {
  try {
    // Return true if whitelist functions don't exist
    return true;
  } catch (error) {
    console.error("Error in checkWhitelist:", error);
    return true; // Allow voting if whitelist check fails
  }
};

const whiteListVoter = async (userWalletAddress) => {
  try {
    // Placeholder - implement if your contract has whitelist
    return { success: true };
  } catch (error) {
    console.error("Error in whiteListVoter:", error);
    throw error;
  }
};

export default {
  // Election management
  createElection,
  endElection,
  getCurrentElectionId,
  isCurrentElectionActive,
  
  // Candidate management
  isCandidate,
  registerCandidate,
  
  // Voting
  vote,
  hasVoted,
  
  // Data retrieval
  getCandidates,
  getAllCandidatesWithVotes,
  getCurrentCandidates,
  getCurrentCandidatesWithVotes,
  
  // Whitelist (legacy/optional)
  checkWhitelist,
  whiteListVoter
};