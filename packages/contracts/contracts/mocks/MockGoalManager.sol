// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

contract MockGoalManager {
    struct Goal {
        address staker;
        uint256 target;
        uint256 stake;
        uint256 created;
        uint256 expires;
    }

    mapping(uint256 => Goal) public goals;

    constructor() {
        Goal memory goal = Goal({
            staker: msg.sender,
            target: 100,
            stake: 500 * 1e18,
            created: block.timestamp,
            expires: block.timestamp + 30 days
        });
        goals[1] = goal;
    }
}
