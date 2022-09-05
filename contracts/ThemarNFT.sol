// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract ThemarNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenCounter;

    constructor() ERC721("exampleCollection","EXC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }


    function safeMint(address to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenCounter.current();
        _tokenCounter.increment();
        _safeMint(to, tokenId);
    }

    function supportsInterface(bytes4 id) public view override(ERC721, AccessControl) returns (bool)
    {
        return super.supportsInterface(id);
    }
}
