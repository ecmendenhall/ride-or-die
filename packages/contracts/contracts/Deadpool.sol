// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Deadpool is ERC20, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public sd3Crv;

    constructor(address _sd3Crv) ERC20("Ride or Die Deadpool", "DIE-sd3Crv") {
        sd3Crv = IERC20(_sd3Crv);
    }

    function issueShares(address to, uint256 amount) external onlyOwner returns (uint256) {
        _mint(to, amount);
        return amount;
    }

    function shareValue(uint256 amount) public view returns (uint256) {
        uint256 totalShares = totalSupply();

        if (totalShares > 0) {
            return sd3Crv.balanceOf(address(this)).mul(amount).div(totalShares);
        } else {
            return amount;
        }
    }

    function pricePerShare() public view returns (uint256) {
        return
        sd3Crv.balanceOf(address(this)).mul(1e18).div(
            totalSupply()
        );
    }

    function redeemShares(uint256 amount) external returns (uint256) {
        _burn(msg.sender, amount);
        sd3Crv.safeTransfer(msg.sender, shareValue(amount));
    }
}
