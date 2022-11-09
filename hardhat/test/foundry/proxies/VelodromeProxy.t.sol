pragma solidity >= 0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "contracts/interfaces/IResonate.sol";
import "contracts/interfaces/ISmartWallet.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "contracts/proxies/VelodromeProxy.sol";
import "contracts/interfaces/IVotingEscrow.sol";

contract VelodromeProxyTest is Test {
    IResonate resonate = IResonate(0x80CA847618030Bc3e26aD2c444FD007279DaF50A);
    IERC1155 fnftHandler = IERC1155(0xA002Dc3E3C163732F4F5e6F941C87b61B5Afca74);
    bytes32 poolId;
    address alice = address(15);
    address team_velo = address(14);
    IERC20 VELO = IERC20(0x3c8B650257cFb5f272f799F5e2b4e65093a11a05);
    IERC20 VELO_USDC_LP = IERC20(0xe8537b6FF1039CB9eD0B71713f697DDbaDBb717d);
    VelodromeProxy VP;
    IVotingEscrow VE = IVotingEscrow(0x9c7305eb78a432ced5C4D14Cac27E8Ed569A2e26);
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

    function testFail_SubmitConsumerExistingVNFT() public {
        startHoax(alice, alice);
        uint amount = 100_000_000e18;
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();

        startHoax(team_velo, team_velo);
        VELO.approve(address(resonate), ~uint(0));
        resonate.submitProducer(poolId, amount, false);
        vm.stopPrank();

        startHoax(alice, alice);
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();
    }

    function testSubmitConsumer() public {
        // submit consumer through proxy
        startHoax(alice, alice);
        uint amount = 100_000_000e18;
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();
        /** 
         * Post conditions of this test
         * 1. We should have one order in the consumer queue for poolId
         * 2. This order should be owned by the VP contract
         * 3. alice should have no velo lps
         * 4. VP should have no velo lps
         */
        (,,bytes32 _owner) = resonate.consumerQueue(poolId, 1);
        assertEq(VELO_USDC_LP.balanceOf(alice), 100_000_000e18);
        assertEq(VELO_USDC_LP.balanceOf(address(VP)), 0);
    }

    function testTrigger() public {
        // Creates a 100_000_000e18 consumer order
        startHoax(alice, alice);
        uint amount = 100_000_000e18;
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();

        startHoax(team_velo, team_velo);
        VELO.approve(address(resonate), ~uint(0));
        resonate.submitProducer(poolId, amount, false);
        vm.stopPrank();

        /**
         * Post conditions of this test, on1155Received should have triggered: 
         * 1. saving the id of the principal
         * 2. transferring the principal to the operator
         * 3. locking up the velo balance into voting for 4 years
         */
        uint principalId = VP.principalFnftId();
        assertGt(principalId, 0);
        assertEq(fnftHandler.balanceOf(address(VP), principalId), 0);
        assertGt(fnftHandler.balanceOf(VP.OPERATOR(), principalId), 0);
        assertEq(VELO.balanceOf(address(VP)), 0);
        uint veNftId = VP.veNftId();
        assertGt(veNftId, 0);
        assertEq(VE.ownerOf(veNftId), address(VP));
    }

    function testFail_ClaimBribeNotOperator() public {
        startHoax(address(13), address(13));
        VP.claimVeNFT();
    }   

    function testFail_ClaimBribeNoVNFT() public {
        startHoax(alice, alice);
        VP.claimVeNFT();    
    }

    function testClaimBribe() public {
        assertEq(true, false);
    }
    function testClaimFees() public {
        assertEq(true, false);
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
        startHoax(alice, alice);
        uint amount = 100_000_000e18;
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();

        startHoax(team_velo, team_velo);
        VELO.approve(address(resonate), ~uint(0));
        resonate.submitProducer(poolId, amount, false);
        vm.stopPrank();

        startHoax(alice, alice);
        VP.claimVeNFT();
    }
    function testWithdrawVNFT() public {
        startHoax(alice, alice);
        uint amount = 100_000_000e18;
        VELO_USDC_LP.approve(address(VP), ~uint(0));
        VP.submitConsumer(poolId, amount, false);
        vm.stopPrank();

        startHoax(team_velo, team_velo);
        VELO.approve(address(resonate), ~uint(0));
        resonate.submitProducer(poolId, amount, false);
        vm.stopPrank();

        skip(2 days);

        startHoax(alice, alice);
        uint veNftId = VP.veNftId();
        VP.claimVeNFT();

        assertEq(VE.ownerOf(veNftId), VP.OPERATOR());
        assertEq(VP.veNftId(), 0);
        assertEq(VP.principalFnftId(), 0);
    }
}