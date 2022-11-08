pragma solidity 0.8.13;


interface IDistributor {
    function claim(uint _tokenId) external returns (uint);
}