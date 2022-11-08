pragma solidity 0.8.13;

interface IVoter {
    function claimFees(address[] memory _fees, address[][] memory _tokens, uint _tokenId) external;
    function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint _tokenId) external;
}
