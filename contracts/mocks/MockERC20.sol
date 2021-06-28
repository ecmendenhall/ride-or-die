// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function mint(address _recipient, uint256 _amount) public {
        _mint(_recipient, _amount);
    }

    function burnFrom(address _recipient, uint256 _amount) public {
        _burn(_recipient, _amount);
    }
}
