pragma solidity 0.8.13;

interface IVoter {
    function claimRewards(address[] memory _gauges, address[][] memory _tokens) external;
    function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint _tokenId) external;
    function claimFees(address[] memory _fees, address[][] memory _tokens, uint _tokenId) external;
    function vote(uint tokenId, address[] calldata _poolVote, uint256[] calldata _weights) external;
    function reset(uint _tokenId) external;
}