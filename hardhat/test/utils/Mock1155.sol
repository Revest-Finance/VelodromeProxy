pragma solidity >= 0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Mock1155 is ERC1155 {
    constructor() ERC1155("") {}

    uint tokenId;

    function mint(address to, uint amount) public {
        _mint(to, tokenId++, amount, bytes(""));
    }
}