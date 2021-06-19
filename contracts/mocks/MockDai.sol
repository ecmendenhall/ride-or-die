// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDai is ERC20 {
    constructor() ERC20("MockDai", "DAI") {}

    function mint(address _recipient, uint256 _amount) public {
        _mint(_recipient, _amount);
    }
}
