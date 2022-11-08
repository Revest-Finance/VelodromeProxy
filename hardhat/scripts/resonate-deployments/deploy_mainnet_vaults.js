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

    const resonate = snapshot['Resonate'];
    const devWallet = snapshot['DevWallet'] 
    const priceProvider = snapshot['PriceProvider'];
    const chainlinkOracleAddr = snapshot['Chainlink'];


    /**
     * Reaper vaults first
     */
    const YearnWrapperFactory = await ethers.getContractFactory("YearnWrapper")

    const yearn_steth_eth = "0xdCD90C7f6324cfa40d7169ef80b12031770B4325"
    const yearn_steth_eth_adapter = YearnWrapperFactory.attach('0x69876c61DBB276F82C84D2F9a3Dd8be52b69DF68');/*
    const yearn_steth_eth_adapter = await YearnWrapperFactory.deploy(yearn_steth_eth);
    await yearn_steth_eth_adapter.deployed();
    console.log("Yearn Adapter STETH-ETH: ", yearn_steth_eth_adapter.address)
    await run("verify:verify", {
        address: yearn_steth_eth_adapter.address,
        constructorArguments: [yearn_steth_eth],
    })*/
    
    const yearn_sushi = "0x6d765CbE5bC922694afE112C140b8878b9FB0390"
    const yearn_sushi_adapter = YearnWrapperFactory.attach('0xA384C9CCA28CC7A58093e4E9A0acaCF8C20072fD');/*
    const yearn_sushi_adapter = await YearnWrapperFactory.deploy(yearn_sushi);
    await yearn_sushi_adapter.deployed();
    console.log("Yearn Adapter ySUSHI: ", yearn_sushi_adapter.address)
    await run("verify:verify", {
        address: yearn_sushi_adapter.address,
        constructorArguments: [yearn_sushi],
    })*/

    const yearn_crv_mim = "0x2DfB14E32e2F8156ec15a2c21c3A6c053af52Be8"
    const yearn_crv_mim_adapter = YearnWrapperFactory.attach('0xdB84260bE05054b42a71D4a287fF17a199C1c8FF');
    /*const yearn_crv_mim_adapter = await YearnWrapperFactory.deploy(yearn_crv_mim);
    await yearn_crv_mim_adapter.deployed();
    console.log("Yearn Adapter ySUSHI: ", yearn_crv_mim_adapter.address)
    await run("verify:verify", {
        address: yearn_crv_mim_adapter.address,
        constructorArguments: [yearn_crv_mim],
    })*/


    console.log("----------Yearn VAULTS DEPLOYED AND VERIFIED...REGISTERING WITH RESONATE-----------------")
    const resonateFactory = await ethers.getContractFactory("Resonate")
    const Resonate = resonateFactory.attach(resonate)
    /*
    let tx = await Resonate.modifyVaultAdapter(yearn_steth_eth, yearn_steth_eth_adapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(yearn_sushi, yearn_sushi_adapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(yearn_crv_mim, yearn_crv_mim_adapter.address);
    await tx.wait();*/

    console.log("\t--------ALL VAULTS REGISTERED SUCCESSFULLY...UPDATING CHAINLINK ORACLES----------")

    console.log("Updating Price Provider with Chainlink Oracles")

    const CLpriceProviderFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const chainlinkOracle = CLpriceProviderFactory.attach(chainlinkOracleAddr)
    const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    const dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    const sushi = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
    const steth = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
    const crv = "0xD533a949740bb3306d119CC777fa900bA034cd52"
    const mim = '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'

    // Price Feeds are all in USD
    const usdc_chainlink = "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6"
    const usdt_chainlink = "0x3e7d1eab13ad0104d2750b8863b489d65364e32d"
    const dai_chainlink = "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9"
    const weth_chainlink = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419"
    const sushi_chainlink = "0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7"
    const steth_chainlink = "0xcfe54b5cd566ab89272946f602d76ea879cab4a8"
    const crv_chainlink = "0xcd627aa160a6fa45eb793d19ef54f5062f20f33f"
    const mim_chainlink = "0x7a364e8770418566e3eb2001a96116e6138eb32f";
    /*
    tx = await chainlinkOracle.setPriceFeed(usdc, usdc_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(usdt, usdt_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(dai, dai_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(weth, weth_chainlink)
    await tx.wait()

    tx = await chainlinkOracle.setPriceFeed(sushi, sushi_chainlink)
    await tx.wait()

    tx = await chainlinkOracle.setPriceFeed(steth, steth_chainlink)
    await tx.wait()

    tx = await chainlinkOracle.setPriceFeed(crv, crv_chainlink)
    await tx.wait()

    tx = await chainlinkOracle.setPriceFeed(mim, mim_chainlink)
    await tx.wait()*/

    console.log(`USDC Chainlink Oracle Set: ${usdc_chainlink}`)
    console.log(`USDT Chainlink Oracle Set: ${usdt_chainlink}`)
    console.log(`DAI Chainlink Oracle Set: ${dai_chainlink}`)
    console.log(`WETH Chainlink Oracle Set: ${weth_chainlink}`)
    console.log(`SUSHI Chainlink Oracle Set: ${sushi_chainlink}`)
    console.log(`STETH Chainlink Oracle Set: ${steth_chainlink}`)
    console.log(`CRV Chainlink Oracle Set: ${crv_chainlink}`)
    console.log(`MIM Chainlink Oracle Set: ${mim_chainlink}`)



    console.log("\t--------VELO TWAP DEPLOYED SUCCESSFULLY...DEPLOYING CURVE ORACLES----------")

    const curveLPOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    const curveLPOracle = curveLPOracleFactory.attach('0x7121b70d66D7999677f77d9Ad9DB65a0D4592e6E');
    const STETH_ETH_POOL = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
    const CURVE_MIM_POOL = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    //const curveLPOracle = await curveLPOracleFactory.deploy(priceProvider, usdc)
    //await curveLPOracle.deployed()
    console.log(`\tCurve LP Oracle Deployed: ${curveLPOracle.address}`)
    /*await run("verify:verify", {
        address: curveLPOracle.address,
        constructorArguments: [priceProvider, usdc],
    })*/
    /*
    console.log("Setting Curve Token for STETH-ETH")
    tx = await curveLPOracle.setCurveTokens(
        [STETH_ETH_POOL], 
        [1], 
        [1],
        [STETH_ETH_POOL],
        [2]
    );
    await tx.wait();

    console.log("Setting Curve Token for MIM-3CRV")
    
    tx = await curveLPOracle.setCurveTokens(
        [CURVE_MIM_POOL], 
        [1], 
        [1],
        [CURVE_MIM_POOL],
        [4]
    );
    await tx.wait();*/

    

    console.log(`\tCurve Token Successfully Set - ${STETH_ETH_POOL}`)
        

    console.log("\t--------DEPLOYMENTS COMPLETE...SETTTING ORACLES IN PRICE PROVIDER----------")

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)

    console.log("\tSetting USDC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracleAddr,{nonce:34})
    await tx.wait()
    console.log("\tUSDC Oracle Set")

    console.log("\tSetting USDT Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdt, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDT Oracle Set")

    console.log("\tSetting DAI Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(dai, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tDAI Oracle Set")

    console.log("\tSetting WETH Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(weth, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tWETH Oracle Set")

    console.log("\tSetting SUSHI Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(sushi, chainlinkOracleAddr)
    await tx.wait()
    console.log("\Sushi Oracle Set")

    console.log("\tSetting STETH oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(steth, chainlinkOracleAddr)
    await tx.wait()
    console.log("\STETH Oracle Set")

    console.log("\tSetting Curve Token oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(crv, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tCRV Token Oracle Set")
    
    console.log("\tSetting MIM Token oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(mim, mim_chainlink);
    await tx.wait()
    console.log("\tCRV Token Oracle Set")

    console.log("\tSetting STETH-ETH Curve LP oracle as Curve Oracle")
    tx = await priceProviderCon.setTokenOracle(STETH_ETH_POOL, curveLPOracle.address)
    await tx.wait()
    console.log("\STETH-ETH LP Oracle Set")

    console.log("\tSetting STETH-ETH Curve LP oracle as Curve Oracle")
    tx = await priceProviderCon.setTokenOracle(CURVE_MIM_POOL, curveLPOracle.address)
    await tx.wait()
    console.log("\STETH-ETH LP Oracle Set")


    const MULTISIG = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
    console.log(`---------TOKEN ORACLES SET. TRANSFERRING OWNERSHIP OF LINK/CRV ORACLES TO MULTISIG: ${MULTISIG}`)
    tx = await curveLPOracle.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await chainlinkOracle.transferOwnership(MULTISIG);
    await tx.wait();

    console.log(`Yearn Adapter: stETH-ETH: ${yearn_steth_eth_adapter.address}`)
    console.log(`Yearn Adapter: SUSHI: ${yearn_sushi_adapter.address}`)
    console.log(`Yearn Adapter: CRV-ETH: ${yearn_crv_mim_adapter.address}`)
    console.log(`Curve LP Oracle: ${curveLPOracle.address}`)


    console.log(`---------SCRIPT COMPLETE---------`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
