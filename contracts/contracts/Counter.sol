// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count;

    constructor() {
        count = 0;
    }

    function increment() public {
        count++;
    }

    function decrement() public {
        require(count > 0, "Counter: Decrement overflow");
        count--;
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}