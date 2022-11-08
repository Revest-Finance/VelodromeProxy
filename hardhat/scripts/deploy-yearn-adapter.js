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

const SFTMX_VAULT = "0xAb30A4956C7d838234e24F1c3E50082C0607F35F";

const DEV_WALLET = "0xc308DcD5c0d67709Ec49F7bf7E8A5960F94bB875";


async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0]; //TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;


    /*
    console.log(SEPERATOR);
    console.log("Deploying Reaper Vault 1")
    const yearnVaultFactory = await ethers.getContractFactory("ReaperWrapper")
    const YearnVault = await yearnVaultFactory.deploy(YEARN_VAULT_1, DEV_WALLET)
    await YearnVault.deployed();*/


    console.log(SEPERATOR);
    console.log("Deploying sFTMx Granary Wrapper")
    const reaperWrapperFactory = await ethers.getContractFactory("ReaperWrapper")
    const ReaperWrapper = await reaperWrapperFactory.deploy(SFTMX_VAULT, DEV_WALLET)
    await ReaperWrapper.deployed();

    console.log(SEPERATOR);

    console.log("\tDeployment Completed.\n");
    console.log(`\tYearn Vault 1 (sFTMx): ${ReaperWrapper.address}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
