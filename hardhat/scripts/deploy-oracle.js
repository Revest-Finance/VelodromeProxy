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
    250: "0x3415E3A79189f9440159E3163518075560670F5E",
    31337: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666"
}


const WFTM = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
const WFTMStaking = "0xB458BfC855ab504a8a327720FcEF98886065529b"
async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    console.log(SEPERATOR);
    console.log("Deploying sFTMx Oracle")
    const sFTMxOracleFactory = await ethers.getContractFactory("sFTMxOracle")
    const sFTMxOracle = await sFTMxOracleFactory.deploy(PRICE_PROVIDERS[chainId], WFTM, WFTMStaking);
    await sFTMxOracle.deployed();


    console.log(SEPERATOR);

    console.log("\tDeployment Completed.\n");
    console.log(`\tsFTMx Oracle: ${sFTMxOracle.address}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
