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

    const resonate = snapshot['Resonate'];
    const devWallet = snapshot['DevWallet'] 
    const priceProvider = snapshot['PriceProvider'];
    const chainlinkOracleAddr = snapshot['Chainlink'];


    const usdc = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    const usdt = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    const mim = "0xa3fa99a148fa48d14ed51d610c367c61876997f1"
    const dai = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
    const wmatic = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    const weth = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
    

    const beefyFactory = await ethers.getContractFactory("BeefyWrapper")

    const mai3crv = "0x3CB928f9B49D9bD6eF43B7310dcC17dB0528CCc6"
    //const mai3crvAdapter = await beefyFactory.deploy(mai3crv, devWallet)
    //await mai3crvAdapter.deployed()
    const mai3crvAdapter = beefyFactory.attach('0xa7550d0c625D2c7Fc658786FC610383E53eb2024');
    console.log(`Beefy MAI-USDC SLP Adapter: ${mai3crvAdapter.address}`)
    

    const maticX = "0xa448e9833095ad50693B025c275F48b271aDe882"
    const maticXAdapater = await beefyFactory.deploy(maticX, devWallet)
    await maticXAdapater.deployed()
    console.log(`Beefy MAI-USDC SLP Adapter: ${maticXAdapater.address}`)
   

    const maiUSDC = "0xebe0c8d842AA5A57D7BEf8e524dEabA676F91cD1"
    const maiUSDCAdapter = await beefyFactory.deploy(maiUSDC, devWallet)
    await maticXAdapater.deployed()
    console.log(`Beefy MAI-USDC SLP Adapter: ${maiUSDCAdapter.address}`)

    console.log("----------ALL VAULTS DEPLOYED AND VERIFIED...REGISTERING WITH RESONATE-----------------")
    const resonateFactory = await ethers.getContractFactory("Resonate")
    const Resonate = resonateFactory.attach(resonate)

    
    let tx = await Resonate.modifyVaultAdapter(mai3crv, mai3crvAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(maticX, maticXAdapater.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(maiUSDC, maiUSDCAdapter.address);
    await tx.wait();

    const univ2Factory = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"
    const TWAPFactory = await ethers.getContractFactory("UniswapV2TWAPOracle")
    const twap = await TWAPFactory.deploy(priceProvider, wmatic, weth, 0, univ2Factory);
    await twap.deployed();
    console.log(`QuickSwap TWAP Deployed: ${twap.address}`)

    
    
    /*
    console.log("\tTWAP CODE VERIFIED, INITIALIZING...")
    const PFI = ""
    tx = await twap.initializeOracle(PFI);
    await tx.wait()
    console.log("\tTWAP INITIALIZED FOR QS")*/

    /*
    const crowd = ""
    tx = await twap.initializeOracle(crowd);
    await tx.wait()
    console.log("\tTWAP INITIALIZED FOR CROWD")*/


    console.log("\t--------DEPLOYING CURVE ORACLE----------")
    console.log(SEPERATOR)
    const mim_2crv = '0x447646e84498552e62eCF097Cc305eaBFFF09308';
    const curveLPOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    const curveLPOracle = await curveLPOracleFactory.deploy(priceProvider, usdc)
    await curveLPOracle.deployed()
    console.log(`\tCurve LP Orale Deployed: ${curveLPOracle.address}`)
    

    console.log("Setting Curve Token for MIM-2CRV")
    tx = await curveLPOracle.setCurveTokens(
        [mim_2crv], 
        [1], 
        [1],
        [mim_2crv],
        [3]
    );
    await tx.wait();
    console.log(`\tCurve Token Successfully Set - ${mim_2crv}`)
        
    console.log("\t--------CURVE ORACLES DEPLOYED SUCCESSFULLY----------")
    

    console.log("\t--------ALL VAULTS DEPLOYED SUCCESSFULLY...UPDATING CHAINLINK ORACLES----------")

    console.log("Updating Price Provider with Chainlink Oracles")

    const CLpriceProviderFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const chainlinkOracle = CLpriceProviderFactory.attach(chainlinkOracleAddr)


    // Price Feeds are all in USD
    const usdc_chainlink = "0xfe4a8cc5b5b2366c1b58bea3858e81843581b2f7"
    const usdt_chainlink = "0x0a6513e40db6eb1b165753ad52e80663aea50545"
    const matic_chainlink = "0xab594600376ec9fd91f8e885dadf0ce036862de0"
    const mim_chainlink = "0xd8d483d813547cfb624b8dc33a00f2fcbcd2d428"
    const dai_chainlink = "0x4746dec9e833a82ec7c2c1356372ccf2cfcd2f3d"

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDC Oracle Set")

    console.log("\tSetting USDT Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdt, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDT Oracle Set")

    console.log("\tSetting WMATIC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(wmatic, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tWETH Oracle Set")

    console.log("\tSetting DAI Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(dai, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tSPELL Oracle Set")

    console.log("\tSetting MIM Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(mim, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tMIM Oracle Set")

    console.log("\tSetting MIM-3CRV Oracle as Curve")
    tx = await priceProviderCon.setTokenOracle(mim_2crv, curveLPOracle.address);
    await tx.wait()
    console.log("\tMIM-3CRV Oracle Set")

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
        address: mai3crvAdapter.address,
        constructorArguments: [mai3crv, devWallet],
    })

    await run("verify:verify", {
        address: maticXAdapater.address,
        constructorArguments: [maticX, devWallet],
    })

    await run("verify:verify", {
        address: maiUSDCAdapter.address,
        constructorArguments: [maiUSDC, devWallet],
    })

    await run("verify:verify", {
        address: twap.address,
        constructorArguments: [priceProvider, wmatic, weth, 0, univ2Factory],
    })

    await run("verify:verify", {
        address: curveLPOracle.address,
        constructorArguments: [priceProvider, usdc],
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
