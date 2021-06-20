// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./MockERC20.sol";

contract MockCurveDepositZap {
    using SafeERC20 for MockERC20;
    using SafeMath for uint256;

    MockERC20 dai;
    MockERC20 threeCrv;
    uint256 virtualPrice = 1.0125 ether;

    constructor(address _dai, address _threeCrv) {
        dai = MockERC20(_dai);
        threeCrv = MockERC20(_threeCrv);
    }

    function add_liquidity(uint256[3] calldata amounts, uint256 min_mint_amount)
        external
        returns (uint256)
    {
        dai.safeTransferFrom(msg.sender, address(this), amounts[0]);
        uint256 lpTokens = amounts[0].mul(1e18).div(virtualPrice);
        threeCrv.mint(msg.sender, lpTokens);
        return lpTokens;
    }
}
