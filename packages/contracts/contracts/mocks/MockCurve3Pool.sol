// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./MockERC20.sol";

contract MockCurve3Pool {
    using SafeERC20 for MockERC20;
    using SafeMath for uint256;

    MockERC20 dai;
    MockERC20 threeCrv;
    uint256 virtualPrice = 1.0125 ether;
    uint256 slippageBps = 10;

    uint256 BPS_DENOMINATOR = 10000;

    constructor(address _dai, address _threeCrv) {
        dai = MockERC20(_dai);
        threeCrv = MockERC20(_threeCrv);
    }

    function add_liquidity(uint256[3] calldata amounts, uint256 min_mint_amount)
        external
    {
        dai.safeTransferFrom(msg.sender, address(this), amounts[0]);
        uint256 lpTokens = lpTokenAmount(amounts[0]);
        threeCrv.mint(msg.sender, lpTokens);
    }

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 min_amount
    ) external {
        threeCrv.safeTransferFrom(msg.sender, address(this), _token_amount);
        uint256 transferOut = daiWithdrawalAmount(_token_amount);
        dai.mint(msg.sender, transferOut);
    }

    // test helpers

    function lpTokenAmount(uint256 amount) public view returns (uint256) {
        return amount.mul(1e18).div(virtualPrice);
    }

    function daiWithdrawalAmount(uint256 amount) public view returns (uint256) {
        uint256 daiAmount = virtualPrice.mul(amount).div(1e18);
        uint256 slippage = daiAmount.mul(slippageBps).div(BPS_DENOMINATOR);
        uint256 transferOut = daiAmount.sub(slippage);
        return transferOut;
    }

}
