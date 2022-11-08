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

    /**
     * Reaper vaults first
     */
    const ReaperWrapperFactory = await ethers.getContractFactory("ReaperWrapper")

    const veloUSDC = "0x111A9B77f95B1E024DF162b42DeC0A2B1C51A00E"
    const veloUSDCAdapter = ReaperWrapperFactory.attach('0x69876c61DBB276F82C84D2F9a3Dd8be52b69DF68');
    /*const veloUSDCAdapter = await ReaperWrapperFactory.deploy(veloUSDC, devWallet);
    await veloUSDCAdapter.deployed();
    console.log("Reaper Adapter VELO-USDC: ", veloUSDCAdapter.address)
    await run("verify:verify", {
        address: veloUSDCAdapter.address,
        constructorArguments: [veloUSDC, devWallet],
    })*/

    const susd_usdc = "0x0766AED42E9B48aa8F3E6bCAE925c6CF82B517eF"
    const susdUSDCAdapter = ReaperWrapperFactory.attach('0xA384C9CCA28CC7A58093e4E9A0acaCF8C20072fD');
    /*const susdUSDCAdapter = await ReaperWrapperFactory.deploy(susd_usdc, devWallet);
    await susdUSDCAdapter.deployed();
    console.log("Reaper Adapter sUSD-USDC: ", susdUSDCAdapter.address)
    await run("verify:verify", {
        address: susdUSDCAdapter.address,
        constructorArguments: [susd_usdc, devWallet],
    })*/

    const op_usdc = "0x2B2CE9Ea2a8428CE4c4Dcd0c19a931968D2F1e7b"
    const opUSDCAdapter = ReaperWrapperFactory.attach('0xdB84260bE05054b42a71D4a287fF17a199C1c8FF');
    /*const opUSDCAdapter = await ReaperWrapperFactory.deploy(op_usdc, devWallet);
    await opUSDCAdapter.deployed();
    console.log("Reaper Adapter OP-USDC: ", opUSDCAdapter.address)
    await run("verify:verify", {
        address: opUSDCAdapter.address,
        constructorArguments: [op_usdc, devWallet],
    })*/

    console.log("----------REAPER VAULTS DEPLOYED AND VERIFIED...DEPLOYING BEEFY VAULTS-----------------")

    const beefyFactory = await ethers.getContractFactory("BeefyWrapper")

    const mai_usdc = "0x01D9cfB8a9D43013a1FdC925640412D8d2D900F0"
    const maiUSDCAdapter = beefyFactory.attach('0x1A5C2ee3FB7fe4A2C2e42474a3657C71f6C775CF');
    /*const maiUSDCAdapter = await beefyFactory.deploy(mai_usdc, devWallet)
    await maiUSDCAdapter.deployed()
    console.log(`Beefy MAI-USDC SLP Adapter: ${maiUSDCAdapter.address}`)
    await run("verify:verify", {
        address: maiUSDCAdapter.address,
        constructorArguments: [mai_usdc, devWallet],
    })*/


    const snx_usdc_velo = "0x48B3EdF0D7412B11c232BD9A5114B590B7F28134"
    const snxUSDCAdapter = beefyFactory.attach('0xA6273F603985D13Ea7405B1B497C3b2F7D798Fd2');
    /*const snxUSDCAdapter = await beefyFactory.deploy(snx_usdc_velo, devWallet)
    await snxUSDCAdapter.deployed()
    console.log(`Beefy SNX-USDC VLP Adapter: ${snxUSDCAdapter.address}`)
    await run("verify:verify", {
        address: snxUSDCAdapter.address,
        constructorArguments: [snx_usdc_velo, devWallet],
    })*/

    const susd_threecrv = "0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF"
    const susd3CrvAdapter = beefyFactory.attach('0xB88e63cEb33Bb29c8D0229b5da79556fD7E5D332');
    /*const susd3CrvAdapter = await beefyFactory.deploy(susd_threecrv, devWallet)
    await susd3CrvAdapter.deployed()
    console.log(`Beefy SUSD_3CRV Adapter: ${susd3CrvAdapter.address}`)
    await run("verify:verify", {
        address: susd3CrvAdapter.address,
        constructorArguments: [susd_threecrv, devWallet],
    })*/

    console.log("----------BEEFY VAULTS DEPLOYED AND VERIFIED...REGISTERING WITH RESONATE-----------------")
    const resonateFactory = await ethers.getContractFactory("Resonate")
    const Resonate = resonateFactory.attach(resonate)

    
    /*let tx = await Resonate.modifyVaultAdapter(veloUSDC, veloUSDCAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(susd_usdc, susdUSDCAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(op_usdc, opUSDCAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(mai_usdc, maiUSDCAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(snx_usdc_velo, susdUSDCAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(susd_threecrv, susd3CrvAdapter.address);
    await tx.wait();*/

    console.log("\t--------ALL VAULTS DEPLOYED SUCCESSFULLY...UPDATING CHAINLINK ORACLES----------")

    console.log("Updating Price Provider with Chainlink Oracles")

    const CLpriceProviderFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const chainlinkOracle = CLpriceProviderFactory.attach(chainlinkOracleAddr)
    const usdc = "0x7f5c764cbc14f9669b88837ca1490cca17c31607"
    const susd = "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
    const snx = "0x8700daec35af8ff88c16bdf0418774cb3d7599b4"
    const usdt = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
    const dai = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
    const weth = "0x4200000000000000000000000000000000000006"
    const op = "0x4200000000000000000000000000000000000042"

    // Price Feeds are all in USD
    const usdc_chainlink = "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3"
    const snx_chainlink = "0x2FCF37343e916eAEd1f1DdaaF84458a359b53877"
    const susd_chainlink = "0x7f99817d87baD03ea21E05112Ca799d715730efe"
    const usdt_chainlink = "0xecef79e109e997bca29c1c0897ec9d7b03647f5e"
    const dai_chainlink = "0x8dba75e83da73cc766a7e5a0ee71f656bab470d6"
    const weth_chainlink = "0x13e3ee699d1909e989722e753853ae30b17e08c5"
    const op_chainlink = "0x0d276fc14719f9292d5c1ea2198673d1f4269246"
    /*
    tx = await chainlinkOracle.setPriceFeed(usdc, usdc_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(snx, snx_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(susd, susd_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(usdt, usdt_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(dai, dai_chainlink)
    await tx.wait()
    
    tx = await chainlinkOracle.setPriceFeed(weth, weth_chainlink)
    await tx.wait()

    tx = await chainlinkOracle.setPriceFeed(op, op_chainlink)
    await tx.wait()*/

    console.log(`USDC Chainlink Oracle Set: ${usdc_chainlink}`)
    console.log(`SNX Chainlink Oracle Set: ${snx_chainlink}`)
    console.log(`SUSD Chainlink Oracle Set: ${susd_chainlink}`)
    console.log(`USDT Chainlink Oracle Set: ${usdt_chainlink}`)
    console.log(`DAI Chainlink Oracle Set: ${dai_chainlink}`)
    console.log(`WETH Chainlink Oracle Set: ${weth_chainlink}`)
    console.log(`OP Chainlink Oracle Set: ${op_chainlink}`)

    console.log("----------CHAINLINK ORACLES SET...DEPLOYING VELO TWAP ORACLES-----------------")

    const TWAPFactory = await ethers.getContractFactory("VelodromeTWAP")
    const veloFactory = "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746"
    const twap = TWAPFactory.attach('0x878eaD7f8162224e162493FD10B97B998f4B0434');
    /*const twap = await TWAPFactory.deploy(priceProvider, usdc, weth, veloFactory);
    await twap.deployed();
    console.log(`VELO TWAP Deployed: ${twap.address}`)
    await run("verify:verify", {
        address: twap.address,
        constructorArguments: [priceProvider, usdc, weth, veloFactory],
    })*/

    const mai = "0xdFA46478F9e5EA86d57387849598dbFB2e964b02"
    const velo = "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05"
    /*tx = await twap.initializeOracle(mai, true)
    await tx.wait()

    tx = await twap.initializeOracle(velo, false)
    await tx.wait()*/

    console.log("\t--------VELO TWAP DEPLOYED SUCCESSFULLY...DEPLOYING CURVE ORACLES----------")

    const curveLPOracleFactory = await ethers.getContractFactory("CurveLPOracle")
    const curveLPOracle = curveLPOracleFactory.attach('0xa7550d0c625D2c7Fc658786FC610383E53eb2024');
    const SUSD_3CRV = "0x061b87122ed14b9526a813209c8a59a633257bab";
    /*const curveLPOracle = await curveLPOracleFactory.deploy(priceProvider, usdc)
    await curveLPOracle.deployed()
    console.log(`\tCurve LP Oracle Deployed: ${curveLPOracle.address}`)
    await run("verify:verify", {
        address: curveLPOracle.address,
        constructorArguments: [priceProvider, usdc],
    })

    console.log("Setting Curve Token for sUSD-3CRV")
    
    tx = await curveLPOracle.setCurveTokens(
        [SUSD_3CRV], 
        [1], 
        [1],
        [SUSD_3CRV],
        [4]
    );
    await tx.wait();*/
    console.log(`\tCurve Token Successfully Set - ${SUSD_3CRV}`)
        
    console.log("\t--------CURVE ORACLES DEPLOYED SUCCESSFULLY...DEPLOYING UNI LP ORACLES----------")
    console.log(SEPERATOR)

    const uniLPOracleFactory = await ethers.getContractFactory("UniswapV2LPPriceOracle")
    const uniLPOracle = await uniLPOracleFactory.deploy(priceProvider)
    await uniLPOracle.deployed()
    console.log(`\tUNI LP Oracle: ${uniLPOracle.address}`)
    await run("verify:verify", {
        address: uniLPOracle.address,
        constructorArguments: [priceProvider],
    })

    console.log("\t--------DEPLOYMENTS COMPLETE...SETTTING ORACLES IN PRICE PROVIDER----------")

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)

    console.log("\tSetting USDC Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(usdc, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tUSDC Oracle Set")

    console.log("\tSetting SNX Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(snx, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tSNX Oracle Set")

    console.log("\tSetting sUSD Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(susd, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tsUSD Oracle Set")

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

    console.log("\tSetting OP Oracle as Chainlink")
    tx = await priceProviderCon.setTokenOracle(op, chainlinkOracleAddr)
    await tx.wait()
    console.log("\tOP Oracle Set")

    console.log("\tSetting MAI oracle as VELO TWAP")
    tx = await priceProviderCon.setTokenOracle(mai, twap.address)
    await tx.wait()
    console.log("\tMAI Oracle Set")

    console.log("\tSetting VELO oracle as VELO TWAP")
    tx = await priceProviderCon.setTokenOracle(velo, twap.address)
    await tx.wait()
    console.log("\tVELO Oracle Set")

    console.log("\tSetting sUSD-3CRV oracle as Curve Oracle")
    tx = await priceProviderCon.setTokenOracle(SUSD_3CRV, curveLPOracle.address)
    await tx.wait()
    console.log("\tSUSD-3CRV Oracle Set")

    const USDC_VELO_LP = "0xe8537b6ff1039cb9ed0b71713f697ddbadbb717d"
    console.log("\tSetting VELO-USDC LP oracle as Uni LP Oracle")
    tx = await priceProviderCon.setTokenOracle(USDC_VELO_LP, uniLPOracle.address)
    await tx.wait()
    console.log("\tVELO-USDC LP Oracle Set")

    const SUSD_USDC_LP = "0xd16232ad60188B68076a235c65d692090caba155"
    console.log("\tSetting SUSD_USDC LP oracle as Uni LP Oracle")
    tx = await priceProviderCon.setTokenOracle(SUSD_USDC_LP, uniLPOracle.address)
    await tx.wait()
    console.log("\tSUSD_USDC LP Oracle Set")

    const OP_USDC_LP = "0x47029bc8f5cbe3b464004e87ef9c9419a48018cd"
    console.log("\tSetting OP_USDC LP oracle as Uni LP Oracle")
    tx = await priceProviderCon.setTokenOracle(OP_USDC_LP, uniLPOracle.address)
    await tx.wait()
    console.log("\tOP_USDC LP Oracle Set")

    const MAI_USDC_LP = "0xd62c9d8a3d4fd98b27caaefe3571782a3af0a737"
    console.log("\tSetting MAI_USDC LP oracle as Uni LP Oracle")
    tx = await priceProviderCon.setTokenOracle(MAI_USDC_LP, uniLPOracle.address)
    await tx.wait()
    console.log("\tMAI_USDC LP Oracle Set")

    const SNX_USDC_LP = "0x9056EB7Ca982a5Dd65A584189994e6a27318067D"
    console.log("\tSetting SNX_USDC LP oracle as Uni LP Oracle")
    tx = await priceProviderCon.setTokenOracle(SNX_USDC_LP, uniLPOracle.address)
    await tx.wait()
    console.log("\tSNX_USDC LP Oracle Set")

    const MULTISIG = "0x7EB2Ea80709146E187f134Eea3a226EBe289AEE5"

    tx = await curveLPOracle.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await twap.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await uniLPOracle.transferOwnership(MULTISIG);
    await tx.wait();

    tx = await chainlinkOracle.transferOwnership(MULTISIG);
    await tx.wait();

    console.log(`Velo-USDC Adapter: ${veloUSDCAdapter.address}`)
    console.log(`sUSD-USDC Adapter: ${susdUSDCAdapter.address}`)
    console.log(`OP-USDC Adapter: ${opUSDCAdapter.address}`)
    console.log(`MAI-USDC Adapter: ${maiUSDCAdapter.address}`)
    console.log(`SNX-USDC Adapter: ${snxUSDCAdapter.address}`)
    console.log(`sUSD-3CRV Adapter: ${susd3CrvAdapter.address}`)
    console.log(`Velodrome TWAP: ${twap.address}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
