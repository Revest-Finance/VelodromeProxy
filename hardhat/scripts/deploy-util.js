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
    1:"",
    250: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666",
    31337: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666"
}

const CHAINLINK_USD = {
    1:'0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    4:"",
    137:"0xefb7e6be8356ccc6827799b6a7348ee674a80eae",
    10:"0x13e3ee699d1909e989722e753853ae30b17e08c5",
    250:"0x11ddd3d147e5b83d01cee7070027092397d63658",
    42161: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
    43114:"",
    31337:'0x11ddd3d147e5b83d01cee7070027092397d63658',
}


async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    let snapshot = require('./data/snapshot' + chainId + '.json');

    const curveLPOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    const MAI_3CRV = "0x6645237fb81fe7227AA2Fa2A244D23A5AC0DA1cd";
    const USDC = '0x7f5c764cbc14f9669b88837ca1490cca17c31607';

    const curveLPOracle = await curveLPOracleFactory.deploy(snapshot['PriceProvider'], USDC);
    await curveLPOracle.deployed()
    console.log(`\tCurve ETH LP Oracle Deployed: ${curveLPOracle.address}`)
    
    console.log("Setting Curve Token for STETH-ETH")
    tx = await curveLPOracle.setCurveTokens(
        [MAI_3CRV], 
        [1], 
        [1],
        [MAI_3CRV],
        [4]
    );
    await tx.wait();

    tx = await curveLPOracle.transferOwnership('0x7EB2Ea80709146E187f134Eea3a226EBe289AEE5');
    await tx.wait();
    
    await run("verify:verify", {
        address: curveLPOracle.address,
        constructorArguments: [
            snapshot['PriceProvider'],
            USDC
        ],
    });
    

    /*
    const YearnWrapperFactory = await ethers.getContractFactory("YearnWrapperV2");

    const yearn_steth_eth = "0xdCD90C7f6324cfa40d7169ef80b12031770B4325"
    //const yearn_steth_eth_adapter = await YearnWrapperFactory.deploy(yearn_steth_eth);
    //await yearn_steth_eth_adapter.deployed();
    //console.log("Yearn Adapter STETH-ETH: ", yearn_steth_eth_adapter.address)
    await run("verify:verify", {
        address: '0x91ee5184763d0b80f8dfdCbdE762b5D13ad295f4',
        constructorArguments: [yearn_steth_eth],
    })


    /*
    const priceProvider = '0x0F89ba3F140Ea9370aB05d434B8e32fDf41a6093';
    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)
    const wftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83';
    const sftmx = '0xd7028092c830b5C8FcE061Af2E593413EbbC1fc1';
    
    console.log("\t--------CURVE ORACLES DEPLOYED SUCCESSFULLY...DEPLOYING SPIRIT TWAP ORACLES----------")
    console.log(SEPERATOR)

    const univ2Factory = "0xEF45d134b73241eDa7703fa787148D9C9F4950b0"
    const TWAPFactory = await ethers.getContractFactory("UniswapV2TWAPOracle")
    const weth = "0x74b23882a30290451A17c44f4F05243b6b58C76d"

    //const twap = TWAPFactory.attach('0xC1e71976c11E26b7A6a12346aFf8c5D0205eACBF');
    
    const priceProvider = snapshot['PriceProvider']
    const twap = await TWAPFactory.deploy(priceProvider, wftm, weth, 0, univ2Factory);
    await twap.deployed();
    console.log(`\tSpirit TWAP Deployed: ${twap.address}`)

    await run("verify:verify", {
        address: twap.address,
        constructorArguments: [priceProvider, wftm, weth, 0, univ2Factory],
    })
    
    console.log("\tTWAP CODE VERIFIED, INITIALIZING...")
    const spirit = "0x5cc61a78f164885776aa610fb0fe1257df78e59b"
    tx = await twap.initializeOracle(spirit);
    await tx.wait()
    console.log("\tTWAP INITIALIZED FOR SPIRIT")

    const oath = "0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6"
    tx = await twap.initializeOracle(oath);
    await tx.wait()
    console.log("\tTWAP INITIALIZED FOR OATH")
    
    console.log("\t--------SPIRIT TWAPS DEPLOYED SUCCESSFULLY...DEPLOYING UNI LP ORACLES----------")
    console.log(SEPERATOR)

    /*
    const staderFactory = await ethers.getContractFactory("sFTMxOracle");
    const StaderOracle = await staderFactory.deploy(snapshot['PriceProvider'], wftm, '0xB458BfC855ab504a8a327720FcEF98886065529b');
    await StaderOracle.deployed();  
    console.log("Stader Oracle deployed to:", StaderOracle.address);
    
    /*
    const curveLPOracleFactory = await ethers.getContractFactory("CurveETHLPOracle")
    const STETH_ETH_MINTER = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
    const STETH_ETH_TOKEN = "0x06325440D014e39736583c165C2963BA99fAf14E";

    const curveLPOracle = await curveLPOracleFactory.deploy(snapshot['PriceProvider']);
    await curveLPOracle.deployed()
    console.log(`\tCurve ETH LP Oracle Deployed: ${curveLPOracle.address}`)
    
    console.log("Setting Curve Token for STETH-ETH")
    tx = await curveLPOracle.setCurveTokens(
        [STETH_ETH_TOKEN], 
        [1], 
        [1],
        [STETH_ETH_MINTER],
        [2]
    );
    await tx.wait();*/
        /*
    await run("verify:verify", {
        address: '0xBf4933c84D331Bd09Be83Cb480C211DdeE3E0080',
        constructorArguments: [
            snapshot['PriceProvider']
        ],
    });


    /*const priceProvider = '0x0F89ba3F140Ea9370aB05d434B8e32fDf41a6093';
    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)*/

    /*
    // Uncomment when redeployment needed
    console.log(SEPERATOR);
    console.log("\tDeploying Chainlink USD Oracle")
    const chainlinkUSDFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    //const ChainlinkUSD = chainlinkUSDFactory.attach("0x3CEaF680A98155acDAfa14FdA047B42825BBC643");
    const chainlinkOracle = await chainlinkUSDFactory.deploy(priceProvider, CHAINLINK_USD[chainId]);
    await chainlinkOracle.deployed();   

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
    
    let tx = await chainlinkOracle.setPriceFeed(usdc, usdc_chainlink)
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
    await tx.wait()

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
    const STETH_ETH_POOL = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
    const CURVE_MIM_POOL = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
    const curveLPOracle = await curveLPOracleFactory.deploy(priceProvider, usdc)
    await curveLPOracle.deployed()
    console.log(`\tCurve LP Oracle Deployed: ${curveLPOracle.address}`)
    
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
    await tx.wait();

    const chainlinkOracleAddr = chainlinkOracle.address;

    console.log("\tSetting USDC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracleAddr)
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
    console.log(`Curve LP Oracle: ${curveLPOracle.address}`)
    console.log(`Chainlink Oracle: ${chainlinkOracle.address}`)
    
    const MULTISIG = "0x9d3477c76e075c59A8D177205DABC17A35c4740d"
    console.log(`---------TOKEN ORACLES SET. TRANSFERRING OWNERSHIP OF LINK/CRV ORACLES TO MULTISIG: ${MULTISIG}`)
    tx = await curveLPOracle.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await chainlinkOracle.transferOwnership(MULTISIG);
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
