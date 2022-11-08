// SPDX-License-Identifier: GNU-GPL
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


import "../interfaces/IResonate.sol";
import "../interfaces/IRevest.sol";
import "../interfaces/IAddressRegistry.sol";
import "../interfaces/IERC4626.sol";
import "../interfaces/ILockManager.sol";
import "../proxies/IVotingEscrow.sol";

interface IVoter {
    function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint _tokenId) external;
    function claimFees(address[] memory _fees, address[][] memory _tokens, uint _tokenId) external;
    function vote(uint tokenId, address[] calldata _poolVote, uint256[] calldata _weights) external;
    function reset(uint _tokenId) external;
}

interface IDistributor {
    function claim(uint _tokenId) external returns (uint);
}

/** 
 * @title VelodromeProxy 
 * @author RobAnon
 * @author 0xTinder
 */
contract VelodromeProxy is Ownable, IERC1155Receiver, IERC721Receiver, ReentrancyGuard {

    using SafeERC20 for IERC20;

    address public RESONATE;

    address public OPERATOR;

    address public DEFAULT_POOL;

    address public DISTRIBUTOR = 0x5d5Bea9f0Fc13d967511668a60a3369fD53F784F;

    IERC1155 public FNFTHandler;
    IVotingEscrow public VOTING_ESCROW;
    ILockManager public LOCK_MANAGER;
    IVoter public VOTER;
    IERC20 public payoutAsset;
    uint public principalFnftId;
    uint public veNftId;
    uint public constant FOUR_YEARS = 365 days * 4;

    constructor(
        address _operator, 
        address _resonate, 
        address _votingEscrow,
        address _voter,
        address _default_pool
    ) {
        OPERATOR = _operator;
        RESONATE = _resonate;
        FNFTHandler = IERC1155(IAddressRegistry(IResonate(RESONATE).REGISTRY_ADDRESS()).getRevestFNFT());
        VOTING_ESCROW = IVotingEscrow(_votingEscrow);
        VOTER = IVoter(_voter);
        DEFAULT_POOL = _default_pool;
        LOCK_MANAGER = ILockManager(IAddressRegistry(IResonate(RESONATE).REGISTRY_ADDRESS()).getLockManager());
    }

    modifier onlyOperator {
        require(msg.sender == OPERATOR, "msg.sender is not operator");
        _;
    }

    function setPool(address _newPool) external onlyOwner {
        DEFAULT_POOL = _newPool;
    }

    function submitConsumer(
        bytes32 poolId, 
        uint amount, 
        bool shouldFarm
    ) external nonReentrant onlyOperator {
        require(principalFnftId == 0 && veNftId == 0, "Must claim previous NFT before re-depositing");
        IResonate resonate = IResonate(RESONATE);
        (address _payoutAsset,,address adapter,,,,) = resonate.pools(poolId);
        require(adapter != address(0), "Invalid pool id");
        // save the payout asset
        payoutAsset = IERC20(_payoutAsset);

        // Derive underlying asset from adapter
        IERC20 asset = IERC20(IERC4626(adapter).asset());

        // Approve resonate to spend contracts tokens
        asset.approve(RESONATE, amount);

        // Gather tokens to deposit
        asset.safeTransferFrom(msg.sender, address(this), amount);

        // Deposit tokens
        resonate.submitConsumer(poolId, amount, shouldFarm);
    }

    function modifyExistingOrder(bytes32 poolId, uint112 amount, uint64 position, bool isProvider) external nonReentrant onlyOperator {
        IResonate resonate = IResonate(RESONATE);
        (address asset,,,,,,) = resonate.pools(poolId);
        resonate.modifyExistingOrder(poolId, amount, position, isProvider);
        IERC20(asset).safeTransfer(msg.sender, amount);
    }

    function claimVeNFT() external nonReentrant onlyOperator {
        require(veNftId != 0 && principalFnftId != 0, "veNFT does not exist!");
        
        require(LOCK_MANAGER.getLockMaturity(principalFnftId), "FNFT not ready to unlock");
        // reset from voting for this epoch, reverts if the token has already voted this epoch
        VOTER.reset(veNftId);

        IERC721(address(VOTING_ESCROW)).safeTransferFrom(address(this), OPERATOR, veNftId);

        veNftId = 0;
        principalFnftId = 0;
    }

    function claimBribes(address[] memory _bribes, address[][] memory _tokens) external nonReentrant onlyOperator {
        require(veNftId != 0 && principalFnftId != 0, "veNFT does not exist!");

        VOTER.claimBribes(_bribes, _tokens, veNftId);

        uint length = _bribes.length;
        for (uint i; i < length; ++i) {
            uint tokensLength = _tokens[i].length;
            for (uint j; j < tokensLength; ++j) {
                IERC20 token = IERC20(_tokens[j][i]);
                token.transfer(OPERATOR, token.balanceOf(address(this)));
            }
        }
    }

    function claimFees(address[] memory _fees, address[][] memory _tokens) external nonReentrant onlyOperator {
        require(veNftId != 0 && principalFnftId != 0, "veNFT does not exist!");

        VOTER.claimFees(_fees, _tokens, veNftId);

        uint length = _fees.length;
        for (uint i; i < length; ++i) {
            uint tokensLength = _tokens[i].length;
            for (uint j; j < tokensLength; ++j) {
                IERC20 token = IERC20(_tokens[j][i]);
                token.transfer(OPERATOR, token.balanceOf(address(this)));
            }
        }
    }

    function claimRebases() external nonReentrant onlyOperator {
        require(veNftId != 0 && principalFnftId != 0, "veNFT does not exist!");
        IDistributor(DISTRIBUTOR).claim(veNftId);
    }

    function reset() external nonReentrant onlyOperator {
        require(veNftId != 0 && principalFnftId != 0, "veNFT does not exist!");
        require(LOCK_MANAGER.getLockMaturity(principalFnftId), "FNFT not ready to unlock");
        IVoter(VOTER).reset(veNftId);
    }


    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return  interfaceId == type(IERC1155Receiver).interfaceId   ||
                interfaceId == type(IERC721Receiver).interfaceId    ||
                interfaceId == type(IERC165).interfaceId;
    }

    /**
     * @dev Handles the receipt of a single ERC1155 token type. This function is
     * called at the end of a `safeTransferFrom` after the balance has been updated.
     *
     * NOTE: To accept the transfer, this must return
     * `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
     * (i.e. 0xf23a6e61, or its own function selector).
     *
     * @param _operator The address which initiated the transfer (i.e. msg.sender), REVEST in correct case
     * @param _from The address which previously owned the token, null address in correct case
     * @param id The ID of the token being transferred, principal fnft id in correct case
     * @param value The amount of tokens being transferred
     * @param data Additional data with no specified format
     * @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
     */
    function onERC1155Received(
        address _operator,
        address _from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external nonReentrant returns (bytes4) {
        require(msg.sender == address(FNFTHandler), "!AUTH");
        require(OPERATOR.code.length == 0, "Operator must be EOA.");
        IAddressRegistry reg = IAddressRegistry(IResonate(RESONATE).REGISTRY_ADDRESS());
        if (_operator == reg.getRevest() && _from == address(0)) {
            // record id
            principalFnftId = id;

            // pass velo onto veNFT and record it.
            payoutAsset.approve(address(VOTING_ESCROW), ~uint(0));
            veNftId = VOTING_ESCROW.create_lock_for(payoutAsset.balanceOf(address(this)), FOUR_YEARS, address(this));
            uint256 _weight = VOTING_ESCROW.balanceOfNFT(veNftId);

            address[] memory pools = new address[](1);
            uint[] memory weights = new uint[](1);

            pools[0] = DEFAULT_POOL;
            weights[0] = _weight;

            // Lock voting to Velodrome 
            IVoter(VOTER).vote(veNftId, pools, weights);

            // pass FNFT to operator
            FNFTHandler.safeTransferFrom(address(this), OPERATOR, id, value, data);
        } 
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    /**
     * @dev Handles the receipt of a multiple ERC1155 token types. This function
     * is called at the end of a `safeBatchTransferFrom` after the balances have
     * been updated.
     *
     * NOTE: To accept the transfer(s), this must return
     * `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
     * (i.e. 0xbc197c81, or its own function selector).
     *
     * @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }

    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}