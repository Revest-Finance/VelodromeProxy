const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');

const SEPERATOR = "\t-----------------------------------------"


async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0]; 
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let snapshot = require('../data/snapshot' + chainId + '.json');

    const devWallet = snapshot['DevWallet'] 
    const priceProvider = snapshot['PriceProvider'];
    const resonate = snapshot['Resonate'];
    const chainlinkOracleAddr = snapshot['Chainlink'];

    const yMim3Pool = "0x1dBa7641dc69188D6086a73B972aC4bda29Ec35d"
    const yearnFactory = await ethers.getContractFactory("YearnWrapper")
    const yearnVaultBoo = yearnFactory.attach('0x1A5C2ee3FB7fe4A2C2e42474a3657C71f6C775CF');
    /*const yearnVaultMIMCrv = await yearnFactory.deploy(yMim3Pool)
    await yearnVaultMIMCrv.deployed()
    console.log("\tBoo Yearn Vault Address: " + yearnVaultMIMCrv.address)
    await run("verify:verify", {
        address: yearnVaultMIMCrv.address,
        constructorArguments: [yMim3Pool],
    })*/

    console.log("----------YEARN VAULTS DEPLOYED AND VERIFIED...DEPLOYING BEEFY-----------------")
    

    const beefyFactory = await ethers.getContractFactory("BeefyWrapper")

    const spellETH = "0x149f3dDeB5FF9bE7342D07C35D6dA19Df3F790af"
    const spellETHAdapter = beefyFactory.attach('0xA384C9CCA28CC7A58093e4E9A0acaCF8C20072fD');
    /*
    const spellETHAdapter = await beefyFactory.deploy(spellETH, devWallet)
    await spellETHAdapter.deployed()
    console.log(`Beefy MAI-USDC SLP Adapter: ${spellETHAdapter.address}`)
    await run("verify:verify", {
        address: spellETHAdapter.address,
        constructorArguments: [spellETH, devWallet],
    })*/


    console.log("----------ALL VAULTS DEPLOYED AND VERIFIED...REGISTERING WITH RESONATE-----------------")
    const resonateFactory = await ethers.getContractFactory("Resonate")
    const Resonate = resonateFactory.attach(resonate)

    
    /*let tx = await Resonate.modifyVaultAdapter(yMim3Pool, yearnVaultMIMCrv.address);
    await tx.wait();
    let tx = await Resonate.modifyVaultAdapter(spellETH, spellETHAdapter.address);
    await tx.wait();*/

    console.log("\t--------ALL VAULTS DEPLOYED SUCCESSFULLY...UPDATING CHAINLINK ORACLES----------")

    console.log("Updating Price Provider with Chainlink Oracles")

    const CLpriceProviderFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const chainlinkOracle = CLpriceProviderFactory.attach(chainlinkOracleAddr)
    const usdc = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
    const usdt = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
    const weth = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
    const mim = "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a"
    const spell = "0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af"
    const dai = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
    

    // Price Feeds are all in USD
    const usdc_chainlink = "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3"
    const usdt_chainlink = "0x3f3f5df88dc9f13eac63df89ec16ef6e7e25dde7"
    const weth_chainlink = "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612"
    const spell_chainlink = "0x383b3624478124697bef675f07ca37570b73992f"
    const mim_chainlink = "0x87121f6c9a9f6e90e59591e4cf4804873f54a95b"
    const dai_chainlink = "0xc5c8e77b397e531b8ec06bfb0048328b30e9ecfb";

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)

    /*
    tx = await chainlinkOracle.setPriceFeed(usdc, usdc_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(usdt, usdt_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(weth, weth_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(mim, mim_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(spell, spell_chainlink)
    await tx.wait()

    tx = await chainlinkOracle.setPriceFeed(dai, dai_chainlink)
    await tx.wait()

    console.log(`USDC Chainlink Oracle Set: ${usdc_chainlink}`)
    console.log(`USDT Chainlink Oracle Set: ${usdt_chainlink}`)
    console.log(`WETH Chainlink Oracle Set: ${weth_chainlink}`)
    console.log(`SPELL Chainlink Oracle Set: ${spell_chainlink}`)
    console.log(`MIM Chainlink Oracle Set: ${mim_chainlink}`)


    console.log("\tSeeting USDC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDC Oracle Set")

    console.log("\tSeeting USDT Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdt, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDT Oracle Set")

    console.log("\tSeeting WETH Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(weth, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tWETH Oracle Set")

    console.log("\tSeeting DAI Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(dai, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tDAI Oracle Set")

    console.log("\tSeeting MIM Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(mim, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tMIM Oracle Set")

    console.log("\tSeeting SPELL Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(spell, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tSPELL Oracle Set")

    console.log("\t--------ORACLES REGISTERED. SCRIPT COMPLETE----------")
    */


    const curveLPOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    const curveLPOracle = await curveLPOracleFactory.deploy(priceProvider, usdc)
    await curveLPOracle.deployed()
    
    await run("verify:verify", {
        address: curveLPOracle.address,
        constructorArguments: [priceProvider, usdc],
    })

    const mim_2crv = '0x30dF229cefa463e991e29D42DB0bae2e122B2AC7';
    console.log("Setting Curve Token for MIM-3CRV")
    tx = await curveLPOracle.setCurveTokens(
        [mim_2crv], 
        [1], 
        [1],
        [mim_2crv],
        [3]
    );
    await tx.wait();
    console.log(`\tCurve Token Successfully Set - ${mim_2crv}`)

    const uniLPOracleFactory = await ethers.getContractFactory("UniswapV2LPPriceOracle")
    const uniLPOracle = await uniLPOracleFactory.deploy(priceProvider)
    await uniLPOracle.deployed()
    
    await run("verify:verify", {
        address: uniLPOracle.address,
        constructorArguments: [priceProvider],
    }) 

    console.log("\tSeeting MIM-3CRV Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(mim_2crv, curveLPOracle.address);
    await tx.wait()
    console.log("\tMIM-3CRV Oracle Set")

    const spell_eth = "0x8f93Eaae544e8f5EB077A1e09C1554067d9e2CA8";
    console.log("\tSeeting SPELL-ETH Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(spell_eth, uniLPOracle.address);
    await tx.wait()
    console.log("\tSPELL-ETH Oracle Set")
    console.log(`\tCurve LP Orale Deployed: ${curveLPOracle.address}`)
    console.log(`\tUNI LP Oracle: ${uniLPOracle.address}`)


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
