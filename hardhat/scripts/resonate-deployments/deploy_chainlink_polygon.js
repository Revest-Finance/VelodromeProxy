const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const { CHAINLINK_USD } = require("../deploy-resonate");

const SEPERATOR = "\t-----------------------------------------"


async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let snapshot = require('../data/snapshot' + chainId + '.json');

    const resonate = snapshot['Resonate'];
    const devWallet = snapshot['DevWallet'] 
    const priceProvider = snapshot['PriceProvider'];

    const usdc = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    const usdt = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    const mim = "0xa3fa99a148fa48d14ed51d610c367c61876997f1"
    const dai = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
    const wmatic = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    const weth = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"

    console.log("\t--------UPDATING CHAINLINK ORACLES----------")

    console.log("Updating Price Provider with Chainlink Oracles")
    
    // Uncomment when redeployment needed
    console.log(SEPERATOR);
    console.log("\tDeploying Chainlink Oracle")
    const chainlinkUSDFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const chainlinkOracle = await chainlinkUSDFactory.deploy(priceProvider.address, CHAINLINK_USD[chainId]);
    await chainlinkOracle.deployed(); 

    // Price Feeds are all in USD
    const usdc_chainlink = "0xfe4a8cc5b5b2366c1b58bea3858e81843581b2f7"
    const usdt_chainlink = "0x0a6513e40db6eb1b165753ad52e80663aea50545"
    const matic_chainlink = "0xab594600376ec9fd91f8e885dadf0ce036862de0"
    const mim_chainlink = "0xd8d483d813547cfb624b8dc33a00f2fcbcd2d428"
    const dai_chainlink = "0x4746dec9e833a82ec7c2c1356372ccf2cfcd2f3d"

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracle.address)
    await tx.wait()
    console.log("\tUSDC Oracle Set")

    console.log("\tSetting USDT Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdt, chainlinkOracle.address)
    await tx.wait()
    console.log("\tUSDT Oracle Set")

    console.log("\tSetting WMATIC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(wmatic, chainlinkOracle.address)
    await tx.wait()
    console.log("\tWETH Oracle Set")

    console.log("\tSetting DAI Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(dai, chainlinkOracle.address)
    await tx.wait()
    console.log("\tSPELL Oracle Set")

    console.log("\tSetting MIM Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(mim, chainlinkOracle.address)
    await tx.wait()
    console.log("\tMIM Oracle Set")

    tx = await chainlinkOracle.setPriceFeed(usdc, usdc_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(usdt, usdt_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(dai, dai_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(mim, mim_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(wmatic, matic_chainlink)
    await tx.wait()

    await run("verify:verify", {
        address: chainlinkOracle.address,
        constructorArguments: [priceProvider,  CHAINLINK_USD[chainId]],
    })

    console.log(`USDC Chainlink Oracle Set: ${usdc_chainlink}`)
    console.log(`USDT Chainlink Oracle Set: ${usdt_chainlink}`)
    console.log(`MATIC Chainlink Oracle Set: ${matic_chainlink}`)
    console.log(`DAI Chainlink Oracle Set: ${dai_chainlink}`)
    console.log(`MAI Chainlink Oracle Set: ${mim_chainlink}`)

    console.log("\t--------ORACLES REGISTERED. SCRIPT COMPLETE----------")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
