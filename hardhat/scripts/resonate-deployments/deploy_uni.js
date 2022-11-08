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

    let snapshot = require('../data/snapshot' + chainId + '.json');
    const multisig = "0xbDE61E4Ade12A1E49047295E1C349308E634934b"
    const priceProvider = "0xDe953B2826AD2df2706829bBAe860b17330334df"

    const uniLPOracleFactory = await ethers.getContractFactory("UniswapV2LPPriceOracle")
    const uniLPOracle = await uniLPOracleFactory.attach("0x950220E4166679D77D0F046CD6936bd9da530D93")
    // console.log(`\tUNI LP Oracle: ${uniLPOracle.address}`)
    // await run("verify:verify", {
    //     address: uniLPOracle.address,
    //     constructorArguments: [priceProvider],
    // })
    let tx = await uniLPOracle.transferOwnership(multisig);
    await tx.wait();

    console.log(`UNI LP Oracle: ${uniLPOracle.address}`)

    console.log("\t--------ORACLES REGISTERED. SCRIPT COMPLETE----------")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
