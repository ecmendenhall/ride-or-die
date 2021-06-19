// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

contract GoalManager {

  struct Goal {
    uint256 target;
    uint256 stake;
    uint256 created;
    uint256 expires;
  }

  mapping (address => Goal) public goals;

  constructor() { }

  function createGoal(uint256 target, uint256 stake) public {
    Goal memory goal = Goal({
      target: target,
      stake: stake,
      created: block.timestamp,
      expires: block.timestamp + 30 days
    });
    goals[msg.sender] = goal;
  }

}
