// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface StakeDAOVault is IERC20 {
    function deposit(uint256 _amount) external;
}

interface CurveDepositZap {
    function add_liquidity(uint256[3] calldata amounts, uint256 min_mint_amount)
        external
        returns (uint256);
}

contract Vault is ERC20 {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public dai;
    IERC20 public threeCrv;
    CurveDepositZap public curveDepositZap;
    StakeDAOVault public stakeDAOvault;

    constructor(
        address _stakeDAOvault,
        address _dai,
        address _threeCrv,
        address _curveDepositZap
    ) ERC20("Commitment Contract Vault", "ccDAI") {
        stakeDAOvault = StakeDAOVault(_stakeDAOvault);
        dai = IERC20(_dai);
        threeCrv = IERC20(_threeCrv);
        curveDepositZap = CurveDepositZap(_curveDepositZap);
    }

    function deposit(uint256 amount) public returns (uint256) {
        // Transfer in DAI from sender
        dai.safeTransferFrom(msg.sender, address(this), amount);

        // Deposit DAI in Curve 3Pool
        dai.approve(address(curveDepositZap), amount);
        uint256 threeCrvAmount = curveDepositZap.add_liquidity(
            [amount, 0, 0],
            0
        );

        // Deposit 3Crv LP token in StakeDAO vault
        threeCrv.approve(address(stakeDAOvault), threeCrvAmount);
        uint256 shareBalanceBefore = stakeDAOvault.balanceOf(address(this));
        stakeDAOvault.deposit(threeCrvAmount);
        uint256 shareBalanceAfter = stakeDAOvault.balanceOf(address(this));
        uint256 shares = shareBalanceAfter.sub(shareBalanceBefore);

        // Mint Vault shares equal to StakeDAO shares
        _mint(msg.sender, shares);
        return shares;
    }
}
