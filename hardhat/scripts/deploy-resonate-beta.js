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
    31337:'0xEf0bF9B5170E0e7f4bBC09f7cBDB145943D3e3a7',
};

const CHAINLINK_USD = {
    1:'',
    4:"",
    137:"",
    250:"0x11ddd3d147e5b83d01cee7070027092397d63658",
    43114:"",
    31337:'0x11ddd3d147e5b83d01cee7070027092397d63658',
}

const WETH = {
    1:'',
    4:"",
    137:"",
    250:"0x74b23882a30290451A17c44f4F05243b6b58C76d",
    43114:"",
    31337:'0x74b23882a30290451A17c44f4F05243b6b58C76d',
}

const NATIVE_TOKEN = {
    1:'',
    4:"",
    137:"",
    250:"0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    43114:"",
    31337:'0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
}

/// TODO: Refactor to a for-loop
const YEARN_VAULT_1 = "0x91155c72ea13BcbF6066dD161BECED3EB7c35e35";
const YEARN_VAULT_2 = "0xFC550BAD3c14160CBA7bc05ee263b3F060149AFF";
const YEARN_VAULT_3 = "0xc749229D5A058Fbd06F57dA69ebA09C7CB8Bf0E7"; // BOO-FTM LP farm
const beefyVault = "0x837BEe8567297dd628fb82FFBA193A57A9F6B655"
const YEARN_BOO_VAULT = '0x0fBbf9848D969776a5Eb842EdAfAf29ef4467698';

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let ResonateAddressRegistry = PROVIDERS[chainId];

    console.log(SEPERATOR);
    console.log("\tDeploying Address Lock Proxy");
    const ResonateAddressProxyFactory = await ethers.getContractFactory("AddressLockProxy");
    const AddressLockProxy = await ResonateAddressProxyFactory.deploy();
    await AddressLockProxy.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying OutputReceiver Proxy")
    const ResonateOutputReceiverProxy = await ethers.getContractFactory("OutputReceiverProxy")
    const OutputReceiverProxy = await ResonateOutputReceiverProxy.deploy(ResonateAddressRegistry);
    await OutputReceiverProxy.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying Sandwich Bot Proxy")
    const SandwichBotProxyFactory = await ethers.getContractFactory("SandwichBotProxy")
    const SandwichBotProxy = await SandwichBotProxyFactory.deploy()
    await SandwichBotProxy.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying ResonateHelper")
    const resonateHelperFactory = await ethers.getContractFactory("ResonateHelper")
    const ResonateHelper = await resonateHelperFactory.deploy(SandwichBotProxy.address)
    await ResonateHelper.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying SmartWalletChecker");
    const smartWalletCheckerFactory = await ethers.getContractFactory("SmartWalletWhitelistV2");
    const SmartWalletCheckerV2 = await smartWalletCheckerFactory.deploy(owner.address);
    await SmartWalletCheckerV2.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying PriceProvider");
    const priceProviderFactory = await ethers.getContractFactory("PriceProvider");
    const PriceProvider = priceProviderFactory.attach("0x3415E3A79189f9440159E3163518075560670F5E");
    //const PriceProvider = await priceProviderFactory.deploy();
    //await PriceProvider.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying DevWallet");
    const devWalletFactory = await ethers.getContractFactory("DevWallet");
    const DevWallet = await devWalletFactory.deploy();
    await DevWallet.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying MetadataHandler");
    const MetadataHandlerFactory = await ethers.getContractFactory("MetadataHandler");
    const MetadataHandler = await MetadataHandlerFactory.deploy();
    await MetadataHandler.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying Resonate");
    const ResonateFactory = await ethers.getContractFactory("Resonate");
    const Resonate = await ResonateFactory.deploy(
        ResonateAddressRegistry,
        OutputReceiverProxy.address,
        AddressLockProxy.address, 
        ResonateHelper.address, 
        SmartWalletCheckerV2.address, 
        PriceProvider.address,
        DevWallet.address
    );
    await Resonate.deployed();

    
    // Uncomment when redeployment needed
    console.log(SEPERATOR);
    console.log("\tDeploying Chainlink USD Oracle")
    const chainlinkUSDFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const ChainlinkUSD = chainlinkUSDFactory.attach("0xF08eB9B6CB72fe76CC8f980be8CA4121651DBd5B");
    //const ChainlinkUSD = await chainlinkUSDFactory.deploy(PriceProvider.address, CHAINLINK_USD[chainId]);
    //await ChainlinkUSD.deployed();

    const CurveOracleFactory = await ethers.getContractFactory("CurveLPOracle");
    const CurveOracle = await CurveOracleFactory.attach("0x9C9b20AD0295Ee5D261c22c731a4C42BC2220666");
    //const CurveOracle = await CurveOracleFactory.deploy(provider, USDC);
    

    console.log(SEPERATOR);
    console.log("\tDeploying Uniswap LP Oracle")
    const uniswapLPFactory = await ethers.getContractFactory("UniswapV2LPPriceOracle");
    const UniswapLP = uniswapLPFactory.attach('0x3a1782Be4Bd9E7d9a1837E6c08Fd62ed836aA7F2');
    //const UniswapLP = await uniswapLPFactory.deploy(NATIVE_TOKEN[chainId], PriceProvider.address);
    //await UniswapLP.deployed();
    
    console.log(SEPERATOR);
    console.log("\tDeploying Reaper Vault (Geist)")
    const reaperVaultFactory = await ethers.getContractFactory("ReaperWrapper")
    // TODO: Must be set for deployment at launch, until then, using old wrappers is fine
    const YearnVault = reaperVaultFactory.attach("0x9806D199bc4c20BF453a50213cEdbd3F3ceE3f34");
    //const YearnVault = await reaperVaultFactory.deploy(YEARN_VAULT_1, DevWallet.address)
    //await YearnVault.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying Reaper Vault (Spooky)")
    const YearnVault2 = reaperVaultFactory.attach("0x892bA4Db77278F563F84FDFba035a602C1889007");
    //const YearnVault2 = await reaperVaultFactory.deploy(YEARN_VAULT_2, DevWallet.address)
    //await YearnVault2.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying Reaper Vault (Spooky LP)")
    const YearnVault3 = reaperVaultFactory.attach("0x7B9D2521293dD1A0F2b6935393dC492Cc808e69D");
    //const YearnVault3 = await reaperVaultFactory.deploy(YEARN_VAULT_3, DevWallet.address)
    //await YearnVault3.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying Rari Vault (Spooky)");
    const RariVaultFactory = await ethers.getContractFactory("RariVault");
    const RariVault = RariVaultFactory.attach("0xf3702252712D5A59399044849Fe893b1A64Af3D8");
    //const BOO_TOKEN = await YearnVault2.asset();
    //const RariVault = await RariVaultFactory.deploy(BOO_TOKEN)
    //await RariVault.deployed();


    console.log(SEPERATOR);
    console.log("\tDeploying Beefy Adapter")

    const BeefyWrapperFactory = await ethers.getContractFactory("BeefyWrapper")
    const BeefyWrapper = BeefyWrapperFactory.attach('0x27D343b7a06ea8A72110e30Ad597145Eac7cFc8a');
    //const BeefyWrapper = await BeefyWrapperFactory.deploy(beefyVault, DevWallet.address);
    //await BeefyWrapper.deployed();

    console.log(SEPERATOR);
    console.log("\tDeploying Yearn Vault (Spooky)")
    const yearnVaultFactory = await ethers.getContractFactory("YearnWrapper")
    //const YearnVault = await yearnVaultFactory.deploy(YEARN_BOO_VAULT, DevWallet.address)
    const YearnSpookyVault = yearnVaultFactory.attach('0x75c51C9f11ED938335F7d61B8c868CC603Ab2997');
    

    console.log("\tDeploying Masterchef")
    const MockMasterChefV2 = await ethers.getContractFactory("MasterChefAdapter")
    const LPToken = "0xEc7178F4C41f346b2721907F5cF7628E388A7a58"
    const masterchefContract = "0x2b2929E785374c651a81A63878Ab22742656DcDd"
    const router = "0xF491e7B69E4244ad4002BC14e878a34207E38c29"
    const boo = "0x841fad6eae12c286d1fd18d1d525dffa75c7effe"
    const wftm = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
    const route0 = [wftm, boo]
    const route1 = [boo]
    const masterchefPool = ethers.BigNumber.from(0); 

    const MasterchefAdapter = MockMasterChefV2.attach('0x5a2B3e47064af96fFC337F80e8474efFcFCbBc05');
    //const MasterchefAdapter = await MockMasterChefV2.deploy(LPToken, masterchefPool, route0, route1, router, masterchefContract, boo, wftm);


    console.log(SEPERATOR);
    console.log("\tSetting up Proxy Contracts with Resonate");
    let tx = await OutputReceiverProxy.setResonate(Resonate.address);
    await tx.wait();
    
    tx = await OutputReceiverProxy.setMetadataHandler(MetadataHandler.address);
    await tx.wait();

    tx = await AddressLockProxy.setResonate(Resonate.address);
    await tx.wait();
    tx = await AddressLockProxy.setMetadataHandler(MetadataHandler.address);
    await tx.wait();

    tx = await MetadataHandler.setResonate(Resonate.address);
    await tx.wait();

    tx = await ResonateHelper.setResonate(Resonate.address);
    await tx.wait();

    tx = await SandwichBotProxy.setResonateHelper(ResonateHelper.address);
    await tx.wait();

    /*
     * Uncomment for redeployment

    console.log(SEPERATOR);
    console.log("\tSetting up Chainlink Feeds");
    for(let i = 0; i < USD_PRICE_FEEDS[chainId].length; i++) {
        let obj = USD_PRICE_FEEDS[chainId][i];
        let tx = await ChainlinkUSD.setPriceFeed(obj.TOKEN, obj.FEED);
        await tx.wait();
        tx = await PriceProvider.setTokenOracle(obj.TOKEN, ChainlinkUSD.address);
        await tx.wait();
        console.log("\n\tSuccessfully registered feed: ",i);
    }

    tx = await PriceProvider.setTokenOracle(CRV_LP, CurveOracle.address);
    await tx.wait();

    console.log("\tSetting up Uniswap LP Oracle");
    let LP_Token = await YearnVault3.asset();
    tx = await PriceProvider.setTokenOracle(LP_Token, UniswapLP.address);
    await tx.wait();
    
    console.log("Setting Curve Token Example")
    tx = await CurveOracle.setCurveTokens(["0x2dd7C9371965472E5A5fD28fbE165007c61439E1"], 
        [1], 
        [1],
        ["0x2dd7C9371965472E5A5fD28fbE165007c61439E1",
        [3]
    ]);
    await tx.wait();

    tx = await CurveOracle.transferOwnership("0x9EB52C04e420E40846f73D09bD47Ab5e25821445");
    await tx.wait();
    */

    console.log(SEPERATOR);
    console.log("\tRegistering Vaults");
    // TODO: Do this with a for-loop and array
    tx = await Resonate.modifyVaultAdapter(YEARN_VAULT_1, YearnVault.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(YEARN_VAULT_2, YearnVault2.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(YEARN_VAULT_3, YearnVault3.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(RariVault.address, RariVault.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(masterchefContract, MasterchefAdapter.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(beefyVault, BeefyWrapper.address);
    await tx.wait();
    tx = await Resonate.modifyVaultAdapter(YEARN_BOO_VAULT, YearnSpookyVault.address);
    await tx.wait();
    

    console.log(SEPERATOR);

    let PoolSmartWallet = await ResonateHelper.POOL_TEMPLATE();
    let SmartWallet = await ResonateHelper.FNFT_TEMPLATE();

    console.log("\tDeployment Completed.\n");
    console.log(`\tResonate: ${Resonate.address}`)
    console.log(`\tAddress Lock Proxy: ${AddressLockProxy.address}`)
    console.log(`\tOutputReceiver Proxy: ${OutputReceiverProxy.address}`)
    console.log(`\tResonate Helper: ${ResonateHelper.address}`)
    console.log(`\tSandwich Bot Proxy: ${SandwichBotProxy.address}`)
    console.log(`\tPriceProvider: ${PriceProvider.address}`)
    console.log(`\tSmart Wallet Checker: ${SmartWalletCheckerV2.address}`)
    console.log(`\tDev Wallet: ${DevWallet.address}`)
    console.log(`\tMetadata Handler: ${MetadataHandler.address}`)
    console.log(`\tChainlink USD Oracle: ${ChainlinkUSD.address}`)
    console.log(`\tUniswap LP Oracle: ${UniswapLP.address}`)
    console.log(`\tGeist Farm: ${YearnVault.address}`)
    console.log(`\tSpooky Farm: ${YearnVault2.address}`)
    console.log(`\tSpooky LP Farm: ${YearnVault3.address}`)
    console.log(`\tRari BOO Farm: ${RariVault.address}`)
    console.log("\tBeefy Adapter: ", BeefyWrapper.address)
    console.log(`\tMasterChefV2 BOO Farm: ${MasterchefAdapter.address}`)
    console.log(`\tYearn BOO Farm: ${YearnSpookyVault.address}`)
    console.log(`\tPoolSmartWallet:${PoolSmartWallet}`)
    console.log(`\tSmartWallet:${SmartWallet}`)



    let snapshot = {
        Resonate: Resonate.address,
        ResonateHelper: ResonateHelper.address,
        AddressLockProxy: AddressLockProxy.address,
        OutputReceiverProxy: OutputReceiverProxy.address,
        ResonateHelper: ResonateHelper.address,
        MetadataHandler: MetadataHandler.address,
        SandwichBotProxy: SandwichBotProxy.address,
        SmartWalletChecker: SmartWalletCheckerV2.address,
        PriceProvider: PriceProvider.address,
        DevWallet: DevWallet.address,
        Chainlink: ChainlinkUSD.address,
        Yearn1:YearnVault.address,
        Yearn2:YearnVault2.address,
        Yearn3:YearnVault3.address,
        YearnSpookyVault:YearnSpookyVault.adddress,
        PoolSmartWallet:PoolSmartWallet,
        SmartWallet:SmartWallet,
        UniswapLP:UniswapLP.address,
        MasterchefAdapter:MasterchefAdapter.address
    };
    
    let stringified = JSON.stringify(snapshot);
    fs.writeFileSync('./scripts/data/snapshot'+chainId+'.json', stringified, (err) => {
        if (err) console.log('Error writing file:', err)
    })
   
}

const USD_PRICE_FEEDS = {
    250: [
        { // USDC
            TOKEN: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
            FEED: "0x2553f4eeb82d5a26427b8d1106c51499cba5d99c"
        },
        { // DAI
            TOKEN: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
            FEED: "0x91d5defaffe2854c7d02f50c80fa1fdc8a721e52"
        },
        { // BOO
            TOKEN: "0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
            FEED: "0xc8c80c17f05930876ba7c1dd50d9186213496376"
        },
        { // FTM
            TOKEN: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            FEED: "0xf4766552d15ae4d256ad41b6cf2933482b0680dc"
        },
        {
            // MIM
            TOKEN: "0x82f0B8B456c1A451378467398982d4834b6829c1",
            FEED: "0x28de48d3291f31f839274b8d82691c77df1c5ced"
        },
        {
            //fUSDT
            TOKEN:"0x049d68029688eAbF473097a2fC38ef61633A3C7A",
            FEED:"0xf64b636c5dfe1d3555a847341cdc449f612307d0"
        },
    ],
    31337: [
        { // USDC
            TOKEN: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
            FEED: "0x2553f4eeb82d5a26427b8d1106c51499cba5d99c"
        },
        { // DAI
            TOKEN: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
            FEED: "0x91d5defaffe2854c7d02f50c80fa1fdc8a721e52"
        },
        { // BOO
            TOKEN: "0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
            FEED: "0xc8c80c17f05930876ba7c1dd50d9186213496376"
        }

    ]
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
