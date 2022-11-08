const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');

const SEPERATOR = "\t-----------------------------------------"



async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    const boo = "0x6645237fb81fe7227AA2Fa2A244D23A5AC0DA1cd"

    //const vaultFactory = await ethers.getContractFactory("RariVault")
    //const rariVault = await vaultFactory.deploy(boo)
    //await rariVault.deployed()

    await run("verify:verify", {
        address: '0x8e20A69aF81eaeDD74589C9d0684557fd54b0DdA',
        constructorArguments: [boo],
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
