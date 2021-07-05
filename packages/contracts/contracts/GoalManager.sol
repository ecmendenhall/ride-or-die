// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IVault {
    function deposit(address depositor, uint256 amount)
        external
        returns (uint256);

    function withdraw(address depositor) external returns (uint256);
}

contract GoalManager is ERC721 {
    using SafeERC20 for IERC20;
    IERC20 public token;
    IVault public vault;

    struct Goal {
        uint256 id;
        uint256 pos;
        address staker;
        uint256 target;
        uint256 stake;
        uint256 created;
        uint256 expires;
    }

    mapping(uint256 => Goal) public goals;
    mapping(address => uint256) public goalsByStaker;

    uint256[] public active;

    constructor(address _token, address _vault)
        ERC721("Ride or Die Goal Token", "RIDE")
    {
        token = IERC20(_token);
        vault = IVault(_vault);
    }

    function createGoal(
        uint256 target,
        uint256 stake,
        uint256 expires,
        string calldata metadataCid
    ) public {
        require(goalsByStaker[msg.sender] == 0, "Goal already set");
        require(token.balanceOf(msg.sender) >= stake, "Insufficient balance");

        uint256 goalId = totalSupply() + 1;
        active.push(goalId);
        Goal memory goal = Goal({
            id: goalId,
            pos: active.length - 1,
            staker: msg.sender,
            target: target,
            stake: stake,
            created: block.timestamp,
            expires: expires
        });

        goals[goalId] = goal;
        goalsByStaker[msg.sender] = goalId;
        _mint(msg.sender, goalId);
        _setTokenURI(goalId, metadataCid);

        token.safeTransferFrom(msg.sender, address(this), stake);
        token.safeIncreaseAllowance(address(vault), stake);
        vault.deposit(msg.sender, stake);
    }

    function redeemGoal(uint256 goalId) public {
        _burn(goalId);
        _remove(goalId);
        delete goalsByStaker[goals[goalId].staker];
        delete goals[goalId];
        vault.withdraw(msg.sender);
    }

    function liquidateGoal(uint256 goalId) public {
        _burn(goalId);
        _remove(goalId);
    }

    function activeGoals() external view returns(uint256[] memory) {
        return active;
    }

    function _remove(uint256 goalId) internal {
        uint256 _move    = active[active.length - 1];
        if (goalId != _move) {
            uint256 _index   = goals[goalId].pos;
            active[_index]   = _move;
            goals[_move].pos = _index;
        }
        active.pop();
        delete goalsByStaker[goals[goalId].staker];
        delete goals[goalId];
    }
}
