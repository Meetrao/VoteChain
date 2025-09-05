import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build absolute path to JSON file
const filePath = path.resolve(__dirname, "./Voting/Voting.json");

// Read and parse the JSON
const VotingJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Export the ABI
export const VotingABI = VotingJson.abi;