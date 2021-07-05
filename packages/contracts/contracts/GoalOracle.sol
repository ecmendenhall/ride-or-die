// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GoalOracle is Ownable {

    struct Progress {
        uint256 val;
        uint256 updated;
    }

    uint256 public lastUpdate;

    mapping(address => Progress) public progress;

    constructor() {}

    function setGoalProgress(address staker, uint256 value) public onlyOwner {
        uint256 updated = block.timestamp;
        Progress memory update = Progress({
            val: value,
            updated: updated
        });
        progress[staker] = update;
        lastUpdate = updated;
    }
}
