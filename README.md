VoteChain is a decentralized voting application built as a hackathon project at Pillai College of Engineering, Panvel. It uses React for the frontend, Express/Node.js for the backend API, Solidity smart contracts for on-chain voting logic, and MetaMask for user authentication and transaction signing. The goal is to provide a transparent, tamper-resistant voting experience suitable for small to medium voting scenarios (college elections, clubs, hackathon polls).

🚀 Project Description
VoteChain enables voters to connect with MetaMask, view active elections, register as voters (if required), and cast votes that are recorded on an Ethereum-compatible blockchain. Votes are processed by a Solidity smart contract to ensure immutability and transparency. A minimal backend (Express) stores off-chain metadata and helps with indexing, while the React frontend provides a clean UI for voters and admins.

This project was developed during a hackathon at Pillai College of Engineering, Panvel.

✨ Features
Connect with MetaMask (wallet-based login)
Create and manage elections (admin)
Candidate registration
Cast votes on-chain (transaction signed via MetaMask)
Real-time vote tallies read from the smart contract
Admin-only controls (start/stop elections)
Lightweight backend for metadata, user roles, and APIs
🧰 Tech Stack
Frontend: React.js (Vite or Create React App)
Backend: Node.js + Express
Smart Contracts: Solidity (Hardhat)
Blockchain client for local testing: Hardhat network (or Ganache)
Wallet: MetaMask
Persistence (optional): MongoDB / JSON files for metadata
Tools: Ethers.js / web3.js, Axios, dotenv
