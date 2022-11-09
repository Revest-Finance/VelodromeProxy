pragma solidity >= 0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "contracts/interfaces/IResonate.sol";
import "contracts/interfaces/ISmartWallet.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "contracts/proxies/VelodromeProxy.sol";
import "contracts/interfaces/IVotingEscrow.sol";

import "../../utils/Mock1155.sol";

contract VelodromeProxyTest is Test {
    IResonate resonate = IResonate(0x80CA847618030Bc3e26aD2c444FD007279DaF50A);
    IERC1155 fnftHandler = IERC1155(0xA002Dc3E3C163732F4F5e6F941C87b61B5Afca74);
    IVotingEscrow VE = IVotingEscrow(0x9c7305eb78a432ced5C4D14Cac27E8Ed569A2e26);
    IERC20 VELO = IERC20(0x3c8B650257cFb5f272f799F5e2b4e65093a11a05);
    IERC20 VELO_USDC_LP = IERC20(0xe8537b6FF1039CB9eD0B71713f697DDbaDBb717d);
    
    VelodromeProxy VP;
    bytes32 poolId;
    address alice = address(15);
    address team_velo = address(14);
    /**
     * 1. Deploy new velodrome proxy
     * 2. Create new resonate pool on VELO-USDC LP => VELO
     * 3. Whitelist the velodrome proxy to use resonate
     */
    function setUp() public {
        vm.label(alice, "alice");
        vm.label(team_velo, "team_velo");
        vm.label(address(resonate), "resonate");
        vm.label(address(fnftHandler), "fnftHandler");

        deal(address(VELO), team_velo, 200_000_000e18);
        deal(address(VELO_USDC_LP), alice, 200_000_000e18);

        VP = new VelodromeProxy(
            alice, // operator
            address(resonate), 
            address(VE), // voting escrow
            0x09236cfF45047DBee6B921e00704bed6D6B8Cf7e, // voter
            0xb7d1b5A725F7f1977aAE752ba1fAE29341F1d7f9  // default pool
        );

        address owner = Ownable(address(resonate)).owner();
        startHoax(owner, owner);
        poolId = resonate.createPool(address(VELO), 0x111A9B77f95B1E024DF162b42DeC0A2B1C51A00E, 200e18, 0, 86400, 1e14, "Foundry");
        ISmartWallet(0x492CbB6217D34d68f0abb77a9D9781C8CcbfdFE8).approveWallet(address(VP));
        vm.stopPrank();
    }
    /**
     * function submitConsumer() negatives: 
     *      1. Invalid pool id
     *      2. Invalid amount
     *      3. tx sent from non-operator
     */
    function testFail_SubmitConsumerInvalidPoolId() public {
        startHoax(alice, alice);
        VP.submitConsumer(bytes32(0), 100_000e18, false);
    }
    function testFail_SubmitConsumerAmountZERO() public {
        startHoax(alice, alice);
        VP.submitConsumer(poolId, 0, false);
    }
    function testFail_SubmitConsumerNotOperator() public {
        startHoax(address(13), address(13));
        VP.submitConsumer(poolId, 100_000e18, false);
    }

    /**
     * function submitConsumer() positive: 
        * Post conditions of this test
        * 1. We should have one order in the consumer queue for poolId
        * 2. This order should be owned by the VP contract (verified by trace)
        * 3. alice should have half original velo lps
        * 4. VP should have no velo lps
        *
    */
    function testSubmitConsumer() public {
        uint startBal = VELO_USDC_LP.balanceOf(alice);

        // submit consumer through proxy
        startHoax(alice, alice);
        uint amount = 100_000_000e18;
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();

        // post
        (,,bytes32 _owner) = resonate.consumerQueue(poolId, 1);
        assertEq(VELO_USDC_LP.balanceOf(alice), startBal - amount);
        assertEq(VELO_USDC_LP.balanceOf(address(VP)), 0);
    }

    /**
     * function onERC1155Received() positive:
        * Post conditions of this test, on1155Received should have triggered: 
        * 1. saving the id of the principal
        * 2. transferring the principal to the operator
        * 3. locking up the velo balance into voting for 4 years
     */
    function testTrigger() public {
        testSubmitConsumer();

        // action from velo team to trigger system
        startHoax(team_velo, team_velo);
        uint amount = 100_000_000e18;
        VELO.approve(address(resonate), ~uint(0));
        resonate.submitProducer(poolId, amount, false);
        vm.stopPrank();

        // post
        uint principalId = VP.principalFnftId();
        assertGt(principalId, 0);
        assertEq(fnftHandler.balanceOf(address(VP), principalId), 0);
        assertGt(fnftHandler.balanceOf(VP.OPERATOR(), principalId), 0);
        assertEq(VELO.balanceOf(address(VP)), 0);
        uint veNftId = VP.veNftId();
        assertGt(veNftId, 0);
        assertEq(VE.ownerOf(veNftId), address(VP));
    }
    /**
     *  function submitConsumer() negative:
     *  trigger system then attempt to submit another consumer order    
     */
    function testFail_SubmitConsumerExistingVNFT() public {
        testTrigger();
        testSubmitConsumer();
    }
    /**
     * Contract can only receive 1155s from resonate
     */
    function testFail_ReceiveOther1155() public {
        Mock1155 mock1155 = new Mock1155();
        mock1155.mint(alice, 1);

        startHoax(alice, alice);
        mock1155.safeTransferFrom(alice, address(VP), 0, 1, bytes(""));
        vm.stopPrank();

        assertEq(VP.veNftId(), 0);
        assertEq(VP.principalFnftId(), 0);
    }

    /**
     * Subsequent 1155 transfers should fail if the veNFT already exists. This
     * prevents overwriting the veNftId.
     */
    function testFail_TriggerTwice() public {
        testTrigger();

        startHoax(team_velo, team_velo);
        uint amount = 100_000_000e18;
        VELO.approve(address(resonate), ~uint(0));
        resonate.submitProducer(poolId, amount, false);
        vm.stopPrank();
    }

    /**
     * Claim function negatives:
     *  1. Not operator calling
     *  2. System not triggered
     *  3. Withdrawing FNFT before unlock
     */
    function testFail_ClaimBribeNotOperator() public {
        startHoax(address(13), address(13));
        VP.claimVeNFT();
    }   
    function testFail_ClaimBribeNoVNFT() public {
        startHoax(alice, alice);
        VP.claimVeNFT();    
    }
    function testFail_WithdrawVNFTNotOperator() public {
        startHoax(address(13), address(13));
        VP.claimVeNFT();
    }
    function testFail_WithdrawVNFTNoVNFT() public {
        startHoax(alice, alice);
        VP.claimVeNFT();
    }
    function testFail_ImmediateWithdrawVNFT() public {
        testTrigger();

        startHoax(alice, alice);
        VP.claimVeNFT();
    }

    function testClaimBribe() public {
        assertEq(true, false);
    }
    function testClaimFees() public {
        assertEq(true, false);
    }

    /**
     *  function claimVeNFT() positive
     */
    function testWithdrawVNFT() public {
        testTrigger();

        skip(2 days);

        startHoax(alice, alice);
        uint veNftId = VP.veNftId();
        VP.claimVeNFT();

        assertEq(VE.ownerOf(veNftId), VP.OPERATOR());
        assertEq(VP.veNftId(), 0);
        assertEq(VP.principalFnftId(), 0);
    }
}