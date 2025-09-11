// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Election {
        uint256 id;
        bool isActive;
        address[] candidates;
        mapping(address => bool) isCandidate;
        mapping(address => uint256) votesCount;
        mapping(address => bool) hasVoted;
    }

    uint256 public currentElectionId;
    mapping(uint256 => Election) private elections;

    event ElectionCreated(uint256 indexed electionId);
    event CandidateRegistered(uint256 indexed electionId, address candidate);
    event VoteCast(uint256 indexed electionId, address voter, address candidate);
    event ElectionEnded(uint256 indexed electionId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // 🔹 IMPROVEMENT: Add check to prevent creating election when one is active
    function createElection() external onlyOwner {
        // Prevent creating new election if current one is still active
        if (currentElectionId > 0) {
            require(!elections[currentElectionId].isActive, "An election is already active");
        }
        
        currentElectionId++;
        Election storage e = elections[currentElectionId];
        e.id = currentElectionId;
        e.isActive = true;

        emit ElectionCreated(currentElectionId);
    }

    // 🔹 IMPROVEMENT: Add validation for zero address
    function registerCandidate(address candidateWallet) external onlyOwner {
        require(candidateWallet != address(0), "Invalid candidate address");
        require(currentElectionId > 0, "No election created yet");
        
        Election storage e = elections[currentElectionId];
        require(e.isActive, "No active election");
        require(!e.isCandidate[candidateWallet], "Candidate already exists");

        e.candidates.push(candidateWallet);
        e.isCandidate[candidateWallet] = true;
        e.votesCount[candidateWallet] = 0;

        emit CandidateRegistered(currentElectionId, candidateWallet);
    }

    // 🔹 IMPROVEMENT: Add validation and better error messages
    function vote(address candidateWallet) external {
        require(candidateWallet != address(0), "Invalid candidate address");
        require(currentElectionId > 0, "No election created yet");
        
        Election storage e = elections[currentElectionId];
        require(e.isActive, "No active election");
        require(e.isCandidate[candidateWallet], "Candidate not registered");
        require(!e.hasVoted[msg.sender], "Already voted");

        e.votesCount[candidateWallet]++;
        e.hasVoted[msg.sender] = true;

        emit VoteCast(currentElectionId, msg.sender, candidateWallet);
    }

    // 🔹 IMPROVEMENT: Add validation
    function endElection() external onlyOwner {
        require(currentElectionId > 0, "No election created yet");
        
        Election storage e = elections[currentElectionId];
        require(e.isActive, "No active election");

        e.isActive = false;
        emit ElectionEnded(currentElectionId);
    }

    // 🔹 IMPROVEMENT: Add validation for election existence
    function getCandidates(uint256 electionId) external view returns (address[] memory) {
        require(electionId > 0 && electionId <= currentElectionId, "Invalid election ID");
        return elections[electionId].candidates;
    }

    function getAllCandidatesWithVotes(uint256 electionId)
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        require(electionId > 0 && electionId <= currentElectionId, "Invalid election ID");
        
        Election storage e = elections[electionId];
        uint256 len = e.candidates.length;
        uint256[] memory votes = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            votes[i] = e.votesCount[e.candidates[i]];
        }
        return (e.candidates, votes);
    }
    
    function isCandidate(uint256 electionId, address wallet) external view returns (bool) {
        if (electionId == 0 || electionId > currentElectionId) return false;
        return elections[electionId].isCandidate[wallet];
    }

    function hasVoted(uint256 electionId, address wallet) external view returns (bool) {
        if (electionId == 0 || electionId > currentElectionId) return false;
        return elections[electionId].hasVoted[wallet];
    }

    // 🔹 NEW: Helper function to check if current election is active
    function isCurrentElectionActive() external view returns (bool) {
        if (currentElectionId == 0) return false;
        return elections[currentElectionId].isActive;
    }

    // 🔹 NEW: Get current election candidates (convenience function)
    function getCurrentCandidates() external view returns (address[] memory) {
        require(currentElectionId > 0, "No election created yet");
        return elections[currentElectionId].candidates;
    }

    // 🔹 NEW: Get current election candidates with votes
    function getCurrentCandidatesWithVotes() external view returns (address[] memory, uint256[] memory) {
        require(currentElectionId > 0, "No election created yet");
        return getAllCandidatesWithVotes(currentElectionId);
    }
}