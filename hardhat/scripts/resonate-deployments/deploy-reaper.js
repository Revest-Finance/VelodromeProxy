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

    //BOO Single sided staking
    const reaperVault = "0xFC550BAD3c14160CBA7bc05ee263b3F060149AFF"

    const devWallet = "0xf5069D55CD518289f8063b0bd21e4E9981556c28"

    console.log(SEPERATOR);
    console.log("Deploying Reaper Adapter")

    const ReaperWrapperFactory = await ethers.getContractFactory("ReaperWrapper")
    const ReaperWrapper = await ReaperWrapperFactory.deploy(reaperVault, devWallet);
    await ReaperWrapper.deployed();

    console.log("Reaper Adapter: ", ReaperWrapper.address)

    await run("verify:verify", {
        address: ReaperWrapper.address,
        constructorArguments: [reaperVault, devWallet],
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
