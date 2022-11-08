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
    const LPToken = "0x4FaA520fe975228F54b30c6996129950E975BD8f"
    const masterchefContract = "0x9C9C920E51778c4ABF727b8Bb223e78132F00aA4"
    const router = "0xF491e7B69E4244ad4002BC14e878a34207E38c29"

    const boo = "0x841fad6eae12c286d1fd18d1d525dffa75c7effe"
    const wftm = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
    const usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
    const orbs = "0x3e01b7e242d5af8064cb9a8f9468ac0f8683617c"

    const route0 = [boo, usdc]
    const route1 = [boo, usdc, orbs]

    const masterchefPool = BigNumber.from(1);

    const masterChefFactory = await ethers.getContractFactory("MasterChefV2Adapter")
    const masterChef = await masterChefFactory.deploy(
        LPToken,
        masterchefPool,
        route0,
        route1,
        router,
        masterchefContract,
        boo, 
        wftm
    )
    
    await run("verify:verify", {
        address: masterChef.address,
        constructorArguments: [
            LPToken,
            masterchefPool,
            route0,
            route1,
            router,
            masterchefContract,
            boo, 
            wftm
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
