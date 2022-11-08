pragma solidity >0.8.0; 

import "forge-std/Test.sol";
import "forge-std/console.sol";


import "contracts/oracles/adapters/velodrome/VelodromeTWAP.sol";
import "contracts/oracles/interfaces/IBVaultV2.sol";

contract VelodromeTWAPTest is Test {
    VelodromeTWAP twap;
    constructor() {
        twap = new VelodromeTWAP(
            0x0F89ba3F140Ea9370aB05d434B8e32fDf41a6093,
            0x7F5c764cBc14f9669B88837ca1490cCa17c31607,
            0x4200000000000000000000000000000000000006,
            0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746
        );
    }   

     function testGetLPPrice() public {
         bytes32 poolId = bytes32(0xc45d42f801105e861e86658648e3678ad7aa70f900010000000000000000011e);
         IBVaultV2 vault = IBVaultV2(0xBA12222222228d8Ba445958a75a0704d566BF2C8);
         vault.getPoolTokens(poolId);

     }
    
 }
