// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
  mapping(address => bool) public isWhiteListed;

  constructor (address initialOwner) Ownable (initialOwner) {}

  function whiteListVoter (address voter) external onlyOwner {
    require(!isWhiteListed[voter], "Already whitelisted");
    isWhiteListed[voter] = true;
  }

  function checkWhitelist (address voter) external view returns(bool){
    return isWhiteListed[voter];
  }
}