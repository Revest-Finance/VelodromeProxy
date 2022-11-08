const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const { curve } = require("elliptic");

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
    const provider = "0x3415E3A79189f9440159E3163518075560670F5E"
    const USDC = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"

    console.log(SEPERATOR);
    console.log("Deploying Curve Oracle")

    const CurveOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    // const CurveOracle = await CurveOracleFactory.attach("0x9C9b20AD0295Ee5D261c22c731a4C42BC2220666")

    const CurveOracle = await CurveOracleFactory.deploy(provider, USDC)

    await run("verify:verify", {
        address: CurveOracle.address,
        constructorArguments: [provider, USDC],
    })

    console.log("Setting Curve Token Example")
    let tx = await CurveOracle.setCurveTokens(["0x2dd7C9371965472E5A5fD28fbE165007c61439E1"], 
        [1], 
        [1],
        ["0x2dd7C9371965472E5A5fD28fbE165007c61439E1",
        [3]
    ])
    await tx.wait();

    console.log("Curve Token Successfully Set - 0x2dd7C9371965472E5A5fD28fbE165007c61439E1")

    console.log("Transferring Ownership of Oracle to Rob")
    tx = await CurveOracle.transferOwnership("0x9EB52C04e420E40846f73D09bD47Ab5e25821445")
    await tx.wait();

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
