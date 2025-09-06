// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    mapping(address => bool) public isWhiteListed;
    mapping(address => uint) public votesCount;
    mapping(address => bool) public hasVoted;
    mapping(address => bool) public isCandidate;

    event VoterWhitelisted(address indexed voter);
    event CandidateRegistered(address indexed candidate);
    event VoteCast(address indexed voter, address indexed candidate);
    event VotingStarted();
    event VotingEnded();

    address[] public candidates;
    bool public isVotingActive = false;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function whiteListVoter(address voter) external onlyOwner {
        require(!isWhiteListed[voter], "Already whitelisted");
        isWhiteListed[voter] = true;
        emit VoterWhitelisted(voter);
    }

    function checkWhitelist(address voter) external view returns (bool) {
        return isWhiteListed[voter];
    }

    function registerCandidate(address candidateWallet) external onlyOwner {
        require(!isCandidate[candidateWallet], "candidate already exist");
        candidates.push(candidateWallet);
        isCandidate[candidateWallet] = true;
        votesCount[candidateWallet] = 0;
        emit CandidateRegistered(candidateWallet);
    }

    function getCandidates() external view returns (address[] memory) {
        return candidates;
    }

    function getAllCandidatesWithVotes()
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        uint256 len = candidates.length;
        uint256[] memory votes = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            votes[i] = votesCount[candidates[i]];
        }
        return (candidates, votes);
    }

    function vote(address candidateWallet) external {
        require(isVotingActive, "Voting is not active");
        require(isWhiteListed[msg.sender], "not Whitelisted");
        require(!hasVoted[msg.sender], "Already voted");
        require(isCandidate[candidateWallet], "Candidate not registered");
        votesCount[candidateWallet] += 1;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, candidateWallet);
    }

    function getVotes(address candidateWallet) external view returns (uint256) {
        return votesCount[candidateWallet];
    }

    function startVoting() external onlyOwner {
        isVotingActive = true;
        emit VotingStarted();
    }

    function endVoting() external onlyOwner {
        isVotingActive = false;
        emit VotingEnded();
    }
}
