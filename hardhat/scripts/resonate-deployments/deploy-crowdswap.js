const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');

const SEPERATOR = "\t-----------------------------------------"

const PROVIDERS = {
    1:'0xd2c6eB7527Ab1E188638B86F2c14bbAd5A431d78',
    4:"0x6c20EE3bCdE467352F935Ac86014F393a1588BBF",
    137:"0x209F3F7750d4CC52776e3e243717b3A8aDE413eB",
    250:"0xEf0bF9B5170E0e7f4bBC09f7cBDB145943D3e3a7",
    43114:"0x64e12fEA089e52A06A7A76028C809159ba4c1b1a",
    31337:'0xd2c6eB7527Ab1E188638B86F2c14bbAd5A431d78',
};

const PRICE_PROVIDERS = {
    250: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666",
    31337: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666"
}

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    //MIM-2CRV Pool
    const router = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    const wMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const rewardToken = "0x483dd3425278C1f79F377f1034d9d2CaE55648B6";
    const masterChef = "0xDC311A12D70Ab2Fae9A34AD2d577edf95c747cDe";
    const lpToken = "0xc34F686947Df1e91e9709777CB70BC8a5584cE92";
    const usdt = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

    const routeToLp0 = [rewardToken];
    const routeToLp1 = [rewardToken, usdt];

    const route0 = [boo, usdc]
    const route1 = [boo, usdc, orbs]

    const masterChefFactory = await ethers.getContractFactory("MasterChefV2_CROWD")
    const masterChefCon = await masterChefFactory.deploy(
        lpToken,
        routeToLp0,
        routeToLp1,
        router,
        masterChef,
        rewardToken, 
        wMATIC
    )

    console.log(`Crowdswap Adapter Deployed: ${masterChef.address}`)

    
    await run("verify:verify", {
        address: masterChefCon.address,
        constructorArguments: [
            lpToken,
            routeToLp0,
            routeToLp1,
            router,
            masterChef,
            rewardToken, 
            wMATIC
        ],
    })

    /*

    console.log("Deploying Rari Vault")
    const MockRariVaultFactory = await ethers.getContractFactory("RariVault")
    const RariVault = await MockRariVaultFactory.deploy("0x841fad6eae12c286d1fd18d1d525dffa75c7effe");
    await RariVault.deployed();

    console.log(SEPERATOR);

    console.log("\tDeployment Completed.\n");
    console.log(`\tMetadataHandler: ${RariVault.address}`)
*/
   
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
