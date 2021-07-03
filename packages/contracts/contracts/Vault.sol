// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface StakeDAOVault is IERC20 {
    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;
}

interface Curve3Pool {
    function add_liquidity(uint256[3] calldata amounts, uint256 min_mint_amount)
        external;

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 min_amount
    ) external;
}

contract Vault is Ownable, ERC20 {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public dai;
    IERC20 public threeCrv;
    Curve3Pool public curve3Pool;
    StakeDAOVault public stakeDAOvault;

    constructor(
        address _stakeDAOvault,
        address _dai,
        address _threeCrv,
        address _curve3Pool
    ) ERC20("Ride or Die Staking Vault", "RIDE-sd3Crv") {
        stakeDAOvault = StakeDAOVault(_stakeDAOvault);
        dai = IERC20(_dai);
        threeCrv = IERC20(_threeCrv);
        curve3Pool = Curve3Pool(_curve3Pool);
    }

    function deposit(address depositor, uint256 amount)
        public
        onlyOwner
        returns (uint256)
    {
        // Transfer in DAI from sender
        dai.safeTransferFrom(msg.sender, address(this), amount);

        // Deposit DAI in Curve 3Pool
        dai.safeIncreaseAllowance(address(curve3Pool), amount);
        uint256 threeCrvBalanceBefore = threeCrv.balanceOf(address(this));
        curve3Pool.add_liquidity([amount, 0, 0], 0);
        uint256 threeCrvBalanceAfter = threeCrv.balanceOf(address(this));
        uint256 threeCrvAmount = threeCrvBalanceAfter.sub(
            threeCrvBalanceBefore
        );

        // Deposit 3Crv LP token in StakeDAO vault
        threeCrv.safeIncreaseAllowance(address(stakeDAOvault), threeCrvAmount);
        uint256 shareBalanceBefore = stakeDAOvault.balanceOf(address(this));
        stakeDAOvault.deposit(threeCrvAmount);
        uint256 shareBalanceAfter = stakeDAOvault.balanceOf(address(this));
        uint256 shares = shareBalanceAfter.sub(shareBalanceBefore);

        // Mint Vault shares equal to StakeDAO shares
        _mint(depositor, shares);
        return shares;
    }

    function withdraw(address shareholder) public onlyOwner returns (uint256) {
        uint256 shares = balanceOf(shareholder);
        _burn(shareholder, shares);

        uint256 threeCrvBalanceBefore = threeCrv.balanceOf(address(this));
        stakeDAOvault.withdraw(shares);
        uint256 threeCrvBalanceAfter = threeCrv.balanceOf(address(this));
        uint256 threeCrvAmount = threeCrvBalanceAfter.sub(
            threeCrvBalanceBefore
        );

        threeCrv.safeIncreaseAllowance(address(curve3Pool), threeCrvAmount);
        uint256 daiBalanceBefore = dai.balanceOf(address(this));
        curve3Pool.remove_liquidity_one_coin(threeCrvAmount, 0, 0);
        uint256 daiBalanceAfter = dai.balanceOf(address(this));
        uint256 daiAmount = daiBalanceAfter.sub(daiBalanceBefore);

        dai.transfer(shareholder, daiAmount);
        return daiAmount;
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        revert("Token is nontransferrable");
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(recipient == address(this), "Unauthorized");
        return super.transferFrom(sender, recipient, amount);
    }
}
