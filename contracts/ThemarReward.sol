// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract ThemarReward is ERC20{
    
    address mintAddress;
    constructor(address _mintAddress) ERC20("RewardsToken", "RTS") {
        mintAddress = _mintAddress;

    }
    modifier onlyMint() {
        require(msg.sender == mintAddress, "NO permisos");
        _;
    }
    function mint(address to, uint256 amount) public onlyMint{
        _mint(to, amount);
    }
}