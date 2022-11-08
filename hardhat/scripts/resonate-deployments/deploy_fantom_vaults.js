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

    const boo = "0x841fad6eae12c286d1fd18d1d525dffa75c7effe"
    const usdc = "0x04068da6c83afcfa0e13ba15a6696662335d5b75"

    const resonate = snapshot['Resonate'];
    const devWallet = snapshot['DevWallet'] 
    const priceProvider = snapshot['PriceProvider'];

    const ReaperWrapperFactory = await ethers.getContractFactory("ReaperWrapper")

    console.log(SEPERATOR);

    const ftmUSDC = "0xa14cD844Afb46a4aC87B2DA710f94738828Ee07C"
    //const ftmUSDCReaperAdapter = ReaperWrapperFactory.attach('0x69876c61DBB276F82C84D2F9a3Dd8be52b69DF68');
    const ftmUSDCReaperAdapter = await ReaperWrapperFactory.deploy(ftmUSDC, devWallet);
    await ftmUSDCReaperAdapter.deployed();
    console.log("\tReaper Adapter FTM-USDC: ", ftmUSDCReaperAdapter.address)
    await run("verify:verify", {
        address: ftmUSDCReaperAdapter.address,
        constructorArguments: [ftmUSDC, devWallet],
    })

    const sftmx = "0xAb30A4956C7d838234e24F1c3E50082C0607F35F"
    //const sftmxReaperAdapter = ReaperWrapperFactory.attach('0xA384C9CCA28CC7A58093e4E9A0acaCF8C20072fD');
    const sftmxReaperAdapter = await ReaperWrapperFactory.deploy(sftmx, devWallet);
    await sftmxReaperAdapter.deployed();
    console.log("\tReaper Adapter sFTMx: ", sftmxReaperAdapter.address)
    await run("verify:verify", {
        address: sftmxReaperAdapter.address,
        constructorArguments: [sftmx, devWallet],
    })


    const spiritFTM = "0x816ffA197Bdf4229aa85b72F8fC338CB89DE300B"
    //const spiritFTMReaperAdapter = ReaperWrapperFactory.attach('0xdB84260bE05054b42a71D4a287fF17a199C1c8FF');
    const spiritFTMReaperAdapter = await ReaperWrapperFactory.deploy(spiritFTM, devWallet);
    await spiritFTMReaperAdapter.deployed();
    console.log("\tReaper Adapter SPIRIT-FTM: ", spiritFTMReaperAdapter.address)
    await run("verify:verify", {
        address: spiritFTMReaperAdapter.address,
        constructorArguments: [spiritFTM, devWallet],
    })


    const yBOO = "0x0fBbf9848D969776a5Eb842EdAfAf29ef4467698"
    const yearnFactory = await ethers.getContractFactory("YearnWrapper")
    //const yearnVaultBoo = yearnFactory.attach('0x1A5C2ee3FB7fe4A2C2e42474a3657C71f6C775CF');
    const yearnVaultBoo = await yearnFactory.deploy(yBOO)
    await yearnVaultBoo.deployed()
    console.log("\tBoo Yearn Vault Address: " + yearnVaultBoo.address)
    await run("verify:verify", {
        address: yearnVaultBoo.address,
        constructorArguments: [yBOO],
    })
    

    const beefyFactory = await ethers.getContractFactory("BeefyWrapper")

    const mim_2crv = "0x837BEe8567297dd628fb82FFBA193A57A9F6B655"
    //const mim2crvBeefyAdapter = beefyFactory.attach('0xA6273F603985D13Ea7405B1B497C3b2F7D798Fd2');
    const mim2crvBeefyAdapter = await beefyFactory.deploy(mim_2crv, devWallet)
    await mim2crvBeefyAdapter.deployed()
    console.log(`\tBeefy MIM+2CRV Adapter: ${mim2crvBeefyAdapter.address}`)
    await run("verify:verify", {
        address: mim2crvBeefyAdapter.address,
        constructorArguments: [mim_2crv, devWallet],
    })


    const mimUSDCSLP = "0x916dD4AB72550E944Fcb56FC1Cc18e07909d86AF"
    //const mim_beefy_USDCSLP_adapter = beefyFactory.attach('0xB88e63cEb33Bb29c8D0229b5da79556fD7E5D332');
    
    const mim_beefy_USDCSLP_adapter = await beefyFactory.deploy(mimUSDCSLP, devWallet)
    await mim_beefy_USDCSLP_adapter.deployed()
    console.log(`\tBeefy MIM_USDC_SLP Adapter: ${mim_beefy_USDCSLP_adapter.address}`)
    await run("verify:verify", {
        address: mim_beefy_USDCSLP_adapter.address,
        constructorArguments: [mimUSDCSLP, devWallet],
    })

    console.log(SEPERATOR);
    console.log("\tRegistering Vaults");
    const resonateFactory = await ethers.getContractFactory("Resonate")
    const Resonate = resonateFactory.attach(resonate)

    
    let tx = await Resonate.modifyVaultAdapter(ftmUSDC, ftmUSDCReaperAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(sftmx, sftmxReaperAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(spiritFTM, spiritFTMReaperAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(yBOO, yearnVaultBoo.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(mim_2crv, mim2crvBeefyAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(mimUSDCSLP, mim_beefy_USDCSLP_adapter.address);
    await tx.wait();


    console.log("\t--------ALL VAULTS DEPLOYED SUCCESSFULLY...UPDATING CHAINLINK ORACLES----------")

    console.log("\tUpdating Price Provider with Chainlink Oracles")
    
    const boo_chainlink = "0xc8c80c17f05930876ba7c1dd50d9186213496376"
    const mim_chainlink = "0x28de48d3291f31f839274b8d82691c77df1c5ced"
    const usdc_chainlink = "0x2553f4eeb82d5a26427b8d1106c51499cba5d99c"
    const dai_chainlink = "0x91d5defaffe2854c7d02f50c80fa1fdc8a721e52"
    const usdt_chainlink = "0xf64b636c5dfe1d3555a847341cdc449f612307d0"
    const ftm_chainlink = "0xf4766552d15ae4d256ad41b6cf2933482b0680dc"

    const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"
    const mim = "0x82f0B8B456c1A451378467398982d4834b6829c1"
    const usdt = "0x049d68029688eabf473097a2fc38ef61633a3c7a"


    console.log(SEPERATOR)
    console.log("\t--------VAULT ADAPTERS SUCCESSFULLY DEPLOYED...MODIFYING CHAINLINK ORACLE----------")

    const CLpriceProviderFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const chainlinkOracleAddr = snapshot['Chainlink'];
    const chainlinkOracle = CLpriceProviderFactory.attach(chainlinkOracleAddr);
    
    

    tx = await chainlinkOracle.setPriceFeed(boo, boo_chainlink)
    await tx.wait()
    console.log(`\tBoo Chainlink Oracle Set: ${boo_chainlink}`)

    tx = await chainlinkOracle.setPriceFeed(mim, mim_chainlink)
    await tx.wait()
    console.log(`\tMIM Chainlink Oracle Set: ${mim_chainlink}`)

    tx = await chainlinkOracle.setPriceFeed(dai, dai_chainlink)
    await tx.wait()
    console.log(`\tDAI Chainlink Oracle Set: ${dai_chainlink}`)

    tx = await chainlinkOracle.setPriceFeed(usdc, usdc_chainlink)
    await tx.wait()
    console.log(`\tUSDC Chainlink Oracle Set: ${usdc_chainlink}`)

    tx = await chainlinkOracle.setPriceFeed(usdt, usdt_chainlink)
    await tx.wait()
    console.log(`\tUSDC Chainlink Oracle Set: ${usdt_chainlink}`)
    
    console.log("\t--------CHAINLINK ORACLES DEPLOYED SUCCESSFULLY...DEPLOYING CURVE ORACLES----------")
    console.log(SEPERATOR)

    const curveLPOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    //const curveLPOracle = curveLPOracleFactory.attach("0x0A009456c7D4bc8047F8a15266A09ae785a592bE");
    const curveLPOracle = await curveLPOracleFactory.deploy(priceProvider, usdc)
    await curveLPOracle.deployed()
    console.log(`\tCurve LP Orale Deployed: ${curveLPOracle.address}`)
    await run("verify:verify", {
        address: curveLPOracle.address,
        constructorArguments: [priceProvider, usdc],
    })

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
        
    console.log("\t--------CURVE ORACLES DEPLOYED SUCCESSFULLY...DEPLOYING SPIRIT TWAP ORACLES----------")
    console.log(SEPERATOR)

    const univ2Factory = "0xEF45d134b73241eDa7703fa787148D9C9F4950b0"
    const TWAPFactory = await ethers.getContractFactory("UniswapV2TWAPOracle")
    const wftm = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
    const weth = "0x74b23882a30290451A17c44f4F05243b6b58C76d"

    //const twap = TWAPFactory.attach('0xC1e71976c11E26b7A6a12346aFf8c5D0205eACBF');
    
    
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

    const uniLPOracleFactory = await ethers.getContractFactory("UniswapV2LPPriceOracle")
    //const uniLPOracle = uniLPOracleFactory.attach("0x062B3aB17dFac433F9E211F95e6a7A0C627c9a62");
    const uniLPOracle = await uniLPOracleFactory.deploy(priceProvider)
    await uniLPOracle.deployed()
    console.log(`\tUNI LP Oracle: ${uniLPOracle.address}`)
    await run("verify:verify", {
        address: uniLPOracle.address,
        constructorArguments: [priceProvider],
    })

    console.log("\t--------ALL ORACLES DEPLOYED SUCCESSFULLY...SETTTING ORACLES IN PRICE PROVIDER----------")
    console.log(SEPERATOR)

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)
    
    console.log("\tSeeting USDC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDC Oracle Set")

    console.log("\tSeeting USDT Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdt, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDT Oracle Set")

    console.log("\tSeeting DAI Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(dai, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tDAI Oracle Set")

    console.log("\tSeeting MIM Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(mim, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tMIM Oracle Set")

    console.log("\tSeeting BOO Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(boo, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tBOO Oracle Set")

    console.log("\tSeeting FTM Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(wftm, ftm_chainlink)
    await tx.wait()
    console.log("\tFTM Oracle Set")

    console.log("\tSeeting SPIRIT Oracle as SPIRITSWAP TWAP")
    tx = await priceProviderCon.setTokenOracle(spirit, twap.address)
    await tx.wait()
    console.log("\tSPIRIT Oracle Set")

    console.log("\tSeeting OATH Oracle as SPIRITSWAP TWAP")
    tx = await priceProviderCon.setTokenOracle(oath, twap.address)
    await tx.wait()
    console.log("\tOATH Oracle Set")



    console.log("\tSetting MIM-2CRV Oracle as CRV")
    tx = await priceProviderCon.setTokenOracle(mim_2crv, curveLPOracle.address)
    await tx.wait()
    console.log("\tMIM-2CRV Oracle Set")

    console.log("\tSetting FTM-USDC LP Oracle")
    tx = await priceProviderCon.setTokenOracle(ftmUSDC, uniLPOracle.address)
    await tx.wait()
    console.log("\tFTM-USDC LP Token Oracle Set")


    
    const MULTISIG = '0x6485947588cfD1Cd316A00196793f9c18fBC2981'; // TODO: ASK ROB FOR MULTISIG ADDRESS ON OPTIMISM ETC

    tx = await curveLPOracle.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await twap.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await uniLPOracle.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await chainlinkOracle.transferOwnership(MULTISIG);
    await tx.wait();


    console.log("\t-------------ALL TOKEN ORACLES SET------------")
    console.log("\t-------------SCRIPT COMPLETE------------------")

    console.log(`\tReaper Vault (FTM-USDC-SLP): ${ftmUSDCReaperAdapter.address}`)
    console.log(`\tReaper Vault (sFTMx): ${sftmxReaperAdapter.address}`)
    console.log(`\tReaper Vault (Spirit-FTM): ${spiritFTMReaperAdapter.address}`)
    console.log(`\tYearn Vault (YBOO): ${yearnVaultBoo.address}`)
    console.log(`\tBeefy Vault (MIM-2CRV): ${mim2crvBeefyAdapter.address}`)
    console.log(`\tBeefy Vault (MIM-USDC-SLP): ${mim2crvBeefyAdapter.address}`)
    console.log(`\tSpirit TWAP: ${twap.address}`)
    console.log(`\tCurve Oracle: ${curveLPOracle.address}`)
    console.log(`\tUni LP Oracle: ${uniLPOracle.address}`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
