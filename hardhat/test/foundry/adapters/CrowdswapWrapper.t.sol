// pragma solidity >= 0.8.0;

// import "forge-std/Test.sol";
// import 'forge-std/console2.sol';
// import "./GenericAdapter.t.sol";
// import "contracts/adapters/masterchefv2/MasterChefV2Adapter_CROWD.sol";
// import "contracts/interfaces/IMasterChefV2_CROWD.sol";

// //forge test --fork-url https://eth-mainnet.alchemyapi.io/v2/zOVFUzSEld1v_MuTOqGPYkTYttwBUrmF --fork-block-number 15564000 --match-contract YearnWrapperTest -vv

// interface crowdStakingLP {
//     function owner() external returns (address);
//     function setOpportunityContract(address _opportunityContract) external;
// }


// contract CrowdswapWrapperTest is AdapterTest {
//     MasterChefV2_CROWD crowdAdapter;

//     address router = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff;
//     address wMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
//     address rewardToken = 0x483dd3425278C1f79F377f1034d9d2CaE55648B6;
//     address masterChef = 0xDC311A12D70Ab2Fae9A34AD2d577edf95c747cDe;
//     address lpToken = 0xc34F686947Df1e91e9709777CB70BC8a5584cE92;
//     address usdt = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;

//     address[] public routeToLp0 = [rewardToken];
//     address[] public routeToLp1 = [rewardToken, usdt];

//     constructor() AdapterTest(IERC4626(setupAdapter(router)), tolerance) {

//     }

//     function setupAdapter(address crypt) public returns (address) {
//         crowdAdapter = new MasterChefV2_CROWD(
//             ERC20(lpToken),
//             routeToLp0,
//             routeToLp1,
//             router,
//             masterChef,
//             rewardToken,
//             wMATIC
//         );// = new ReaperWrapper(0x4f086A048c33f3BF9011dd2265861ce812624f2c);
//         // console2.log("Adapter: ", address(ReaperAdapter));
//         address owner = crowdStakingLP(masterChef).owner();
//         hoax(owner, owner);
//         crowdStakingLP(masterChef).setOpportunityContract(address(crowdAdapter));


//         vault = masterChef;
//         return address(crowdAdapter);
//     }

//     function testWithdraw(uint amount, uint withdrawAmount) public virtual override{
//         vm.assume(amount < 1e36 && amount > 1e18);
//         vm.assume(withdrawAmount < amount && withdrawAmount >= 1e18);

//         startHoax(alice, alice);

//         asset.approve(address(adapter), amount);
//         uint shares_received = adapter.deposit(amount, alice);

//         uint aliceBalance = asset.balanceOf(alice);
//         uint aliceAdapterBalance = adapter.balanceOf(alice);

//         IMasterChefV2_CROWD crowdVault = IMasterChefV2_CROWD(masterChef);

//         uint adapterBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;

//         uint preview = adapter.previewWithdraw(withdrawAmount);

//         uint shares_burnt = adapter.withdraw(withdrawAmount, alice, alice);

//         console2.log("WITHDRAW COMPLETE");

//         assertEq(asset.balanceOf(alice), aliceBalance + withdrawAmount, "Alice's LP Balance should've increaseed by withdrawAmount");
//         assertEq(adapter.balanceOf(alice), aliceAdapterBalance - preview, "Alice Share Balance did not decrease by preview");
//         assertEq(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, adapterBalance - withdrawAmount, "Adapter LP Balance did not decrease by withdrawAmount");
//         assertEq(preview, shares_burnt, "Shares burnt does not match expected");
//     }

//     function testMint(uint amount) public virtual override {
//         vm.assume(amount < 1e52 && amount > 1e18);

//         startHoax(alice, alice);

//         uint alicePreBal = adapter.balanceOf(alice);
//         uint preview = adapter.previewMint(amount);

//         asset.approve(address(adapter), preview);
//         uint aliceBalance = asset.balanceOf(alice);

//         IMasterChefV2_CROWD crowdVault = IMasterChefV2_CROWD(masterChef);

//         uint adapterBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;

//         uint assets_used_to_mint = adapter.mint(amount, alice);

//         assertEq(asset.balanceOf(alice), aliceBalance - preview, "Alice Balance did not decrease by preview");
//         assertEq(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, adapterBalance + preview, "Adapter asset Balance did not increase by preview");
//         assertEq(adapter.balanceOf(alice), alicePreBal + preview, "Alice share balance did not increase by preview");
//         assertEq(preview, assets_used_to_mint, "shares expected not matching shares minted");
//     }

//     function testRedeem(uint amount, uint redeemAmount) public virtual override {
//         vm.assume(amount < 1e36 && amount > 1e18);
//         vm.assume(redeemAmount <= amount && redeemAmount > 1e18);

//         startHoax(alice, alice);

//         asset.approve(address(adapter), amount);
//         uint shares_received = adapter.mint(amount, alice);

//         uint aliceBalance = asset.balanceOf(alice);

//         IMasterChefV2_CROWD crowdVault = IMasterChefV2_CROWD(masterChef);

//         uint adapterBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;

//         uint preview = adapter.previewRedeem(redeemAmount);
//         uint assets_withdrawn = adapter.redeem(redeemAmount, alice, alice);


//         assertEq(asset.balanceOf(alice), aliceBalance + assets_withdrawn );
//         assertEq(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, adapterBalance - redeemAmount);
//         assertEq(preview, assets_withdrawn);
//     }

//         // Round trips
//     function testRoundTrip_deposit_withdraw(uint amount) public virtual override {
//         // Deposit
//         vm.assume(amount < 1e36 && amount > 1e18);

//         startHoax(alice, alice);
//         asset.approve(address(adapter), amount);
//         uint initAliceBalance = asset.balanceOf(alice);

//         IMasterChefV2_CROWD crowdVault = IMasterChefV2_CROWD(masterChef);
//         uint initadapterBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;

//         uint previewDeposit = adapter.previewDeposit(amount);
//         uint deposit = adapter.deposit(amount, alice);

//         assertEq(asset.balanceOf(alice), initAliceBalance - amount);
//         assertEq(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, initadapterBalance + amount);
//         assertEq(previewDeposit, deposit);
        
//         // Withdraw
//         uint previewWithdraw = adapter.previewWithdraw(amount);
//         uint shares_burnt = adapter.withdraw(amount, alice, alice);

//         assertApproxEqAbs(asset.balanceOf(alice), initAliceBalance, tolerance);
//         assertApproxEqAbs(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, initadapterBalance, tolerance);
//         assertEq(previewWithdraw, shares_burnt);
//     }

//     function testRoundTrip_mint_redeem(uint amount) public virtual override {
//         // Mint
//         vm.assume(amount < 1e36 && amount > 1e18);

//         startHoax(alice, alice);
//         asset.approve(address(adapter), amount);
//         uint initAliceBalance = asset.balanceOf(alice);

//         IMasterChefV2_CROWD crowdVault = IMasterChefV2_CROWD(masterChef);
//         uint initadapterBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;

//         uint previewMint = adapter.previewMint(amount);
//         uint mint = adapter.mint(amount, alice);

//         assertEq(asset.balanceOf(alice), initAliceBalance - previewMint);
//         assertEq(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, initadapterBalance + previewMint);
//         assertEq(previewMint, mint);

//         // Redeem
//         uint previewRedeem = adapter.previewRedeem(amount);
//         uint shares_converted = adapter.redeem(amount, alice, alice);

//         assertApproxEqAbs(asset.balanceOf(alice), initAliceBalance, tolerance);
//         assertApproxEqAbs(crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance, initadapterBalance, tolerance);
//         assertApproxEqAbs(previewRedeem, shares_converted, tolerance);
//     }

//     function testHarvest() public virtual override {
//         uint amount = 10e18;
//         startHoax(alice, alice);
//         asset.approve(address(adapter), amount);
//         uint shares_minted = adapter.deposit(amount, alice);

//         skip(2592000); //skip forward a month to let rewards accrue

//         IMasterChefV2_CROWD crowdVault = IMasterChefV2_CROWD(masterChef);
//         uint initadapterBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;
//         deal(rewardToken, address(crowdAdapter), 10e18);
//         crowdAdapter.harvest();

//         uint newBalance = crowdVault.lpStakeholders(address(crowdAdapter)).userLpBalance;
//         console2.log("new balance: ", newBalance);
//         console2.log("old balance: ", initadapterBalance);

//         uint rewardsAfterHarvest = crowdVault.earned(address(crowdAdapter));

//         assertGt(newBalance, initadapterBalance, "Adapter Balance did not increase after harvest");
//         assertEq(rewardsAfterHarvest, 0, "all rewards not harvested");
//     }
// }