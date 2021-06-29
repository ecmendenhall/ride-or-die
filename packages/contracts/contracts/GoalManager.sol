// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract GoalManager is ERC721 {
    using SafeERC20 for IERC20;
    IERC20 public token;

    struct Goal {
        uint256 target;
        uint256 stake;
        uint256 created;
        uint256 expires;
    }

    mapping(uint256 => Goal) public goals;
    mapping(address => uint256) goalsByStaker;

    constructor(address _tokenAddress)
        ERC721("Ride or Die Goal Token", "RIDE")
    {
        token = IERC20(_tokenAddress);
    }

    function createGoal(
        uint256 target,
        uint256 stake,
        string calldata metadataCid
    ) public {
        require(goalsByStaker[msg.sender] == 0, "Goal already set");
        require(token.balanceOf(msg.sender) >= stake, "Insufficient balance");

        uint256 goalId = totalSupply() + 1;
        Goal memory goal = Goal({
            target: target,
            stake: stake,
            created: block.timestamp,
            expires: block.timestamp + 30 days
        });
        goals[goalId] = goal;
        goalsByStaker[msg.sender] = goalId;
        _mint(msg.sender, goalId);
        _setTokenURI(goalId, metadataCid);

        token.safeTransferFrom(msg.sender, address(this), stake);
    }

    function redeemGoal(uint256 goalId) public {
        _burn(goalId);
        delete goals[goalId];
    }

    function liquidateGoal(uint256 goalId) public {
        _burn(goalId);
        delete goals[goalId];
    }
}
