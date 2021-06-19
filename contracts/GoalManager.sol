// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract GoalManager {
    using SafeERC20 for IERC20;
    IERC20 public token;

    struct Goal {
        uint256 target;
        uint256 stake;
        uint256 created;
        uint256 expires;
    }

    mapping(address => Goal) public goals;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function createGoal(uint256 target, uint256 stake) public {
        require(goals[msg.sender].target == 0, "Goal already set");
        require(token.balanceOf(msg.sender) >= stake, "Insufficient balance");

        Goal memory goal = Goal({
            target: target,
            stake: stake,
            created: block.timestamp,
            expires: block.timestamp + 30 days
        });
        goals[msg.sender] = goal;

        token.safeTransferFrom(msg.sender, address(this), stake);
    }
}
