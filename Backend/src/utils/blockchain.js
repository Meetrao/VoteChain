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
  return await votingContractRead.checkWhitelist(userWalletAddress);
}

const whiteListVoter = async (userWalletAddress) => {
  return await votingContractWrite.whiteListVoter(userWalletAddress);
}

export default {
  checkWhitelist,
  whiteListVoter
}
