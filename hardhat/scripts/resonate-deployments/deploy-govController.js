const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const { BigNumber } = require("ethers");
const { Console } = require("console");

const SEPERATOR = "\t-----------------------------------------"

const SEVEN_DAY_LOCKS = {
    1: '0x83c3784D2d38b8D00080376323B6e165A25a0Db0',
    4:"0xc778417e063141139fce010982780140aa0cd5ab",
    10: "0x3eaFA14c0a75078C3084d95763C993D9425fa899",
    137:"0xA609E38E8C2A88354AB7d683d377e37A05884670",
    250:"0xC8cAE8763F4BaBa3483B984810D1106e8b19f5ff",
    42161:"0x10722a92Ce69178d0faF2E6002DFe9cae544562a",
    31337:"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

const THREE_DAY_LOCKS = {
    1: '0x9af720720ba09Ae03C1eB2CB5b7B780469F0F1B7',
    4:"0xc778417e063141139fce010982780140aa0cd5ab",
    10: "0xfA47f668241fd596c50B7081AcF528f225f8Cc6d",
    137: "0x6b0d72C677345f2e4141085532A2e27927BB83e0",
    250:"0xe0053233e7250eA80430b7fF51Bbeb49Ef9c8dC6",
    42161:"0x3eaFA14c0a75078C3084d95763C993D9425fa899",
    31337:"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

const MULTISIGS = {
    1: '0x9d3477c76e075c59A8D177205DABC17A35c4740d',
    4:"0xc778417e063141139fce010982780140aa0cd5ab",
    10: "0x7EB2Ea80709146E187f134Eea3a226EBe289AEE5",
    137: "0xbDE61E4Ade12A1E49047295E1C349308E634934b",
    250:"0x6485947588cfD1Cd316A00196793f9c18fBC2981",
    42161:"0x397002E9E957990fe39E84FD55095f998a953e81",
    31337:"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};





async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let snapshot = require('../data/snapshot' + chainId + '.json');

    const resonate = snapshot['Resonate'];
    const resonateHelper = snapshot['ResonateHelper'];
    const priceProvider = snapshot['PriceProvider'];
    const orp = snapshot['OutputReceiverProxy'];
    const alp = snapshot['AddressLockProxy'];
    const smartWalletWhitelist = snapshot['SmartWalletChecker'];
    const sandwichBotProxy = snapshot['SandwichBotProxy'];

    const deployer = "0xaF84f7D4061df1AaFbbec39DE7726D4F80beb652"; // Hardware

    const sevendayTimelock = SEVEN_DAY_LOCKS[chainId];
    const threedayTimelock = THREE_DAY_LOCKS[chainId];
    const multisig = MULTISIGS[chainId];

    const team = deployer; // TEMP
    const admin = deployer; // TEMP

    const sandwichBot = multisig; // TEMP LAUNCH MEASURE 

    const govControllerFactory = await ethers.getContractFactory("GovernanceController")
    //const govController = govControllerFactory.attach("0x06abe1539BCb89600041cE6c1a797fE28e2D8fF9");
    const govController = await govControllerFactory.deploy(owner.address)
    await govController.deployed()

    // ONLY ON CHAINS WHERE NOT DEPLOYED ONCE
    await run("verify:verify", {
        address: govController.address,
        constructorArguments: [owner.address]
    })

    console.log("\tDeployed Governance Controller: ", govController.address);

    const devWalletFactory = await ethers.getContractFactory('DevWallet');
    const DevWallet = devWalletFactory.attach(snapshot['DevWallet']);
    let tx = await DevWallet.transferOwnership(multisig);
    await tx.wait();

    const MetadataHandlerFactory = await ethers.getContractFactory('MetadataHandler');
    const MetadataHandler = MetadataHandlerFactory.attach(snapshot['MetadataHandler']);
    tx = await MetadataHandler.transferOwnership(multisig);
    await tx.wait();

    //Resonate
    let contracts = [
        resonate, 
        resonate
    ]

    let owners = [
        //threedayTimelock, // Not at launch
        multisig,
        sevendayTimelock
    ]

    let selectors = [
        BigNumber.from("0x21476015"), //modifyVaultAdapter
        BigNumber.from("0xf2fde38b") //transferOwnership
    ]

    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("Resonate.sol Set")

    //PriceProvider.sol
    contracts = [
        priceProvider,
        priceProvider
    ]

    owners = [
        //threedayTimelock,
        multisig,
        sevendayTimelock
    ]

    selectors = [
        BigNumber.from("0x764467cc"),//setTokenOracle
        BigNumber.from("0xf2fde38b") //transferOwnership
    ]

    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("Price Provider Set")
    
    //SmartWalletWhitelistV2
    contracts = [
        smartWalletWhitelist,
        smartWalletWhitelist,
        smartWalletWhitelist,
        smartWalletWhitelist,
        smartWalletWhitelist,
        smartWalletWhitelist,
        smartWalletWhitelist,
    ]

    owners = [
        threedayTimelock,
        multisig,
        multisig,
        sevendayTimelock,
        admin,
        admin,
        admin,
    ]

    selectors = [
        BigNumber.from("0x0c6dd9fd"), //transferSuperAdmin
        BigNumber.from("0xdc11a496"), //changeAdmin
        BigNumber.from("0x943f35a4"), //commitSetChecker
        BigNumber.from("0x26b42b1a"), //applySetChecker
        BigNumber.from("0x0fcb0ae5"), // approveWallet
        BigNumber.from("0xf472fafb"), // batchApproveWallets
        BigNumber.from("0x808a9d40"), // revokeWallet
    ]
    
    
    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("SmartWallet Whitelist Set")

    // Address Lock Proxy
    contracts = [
        alp,
        alp
    ]

    owners = [
        multisig,
        deployer
    ]

    selectors = [
        BigNumber.from("0xfe762024"), //setMetadataHandler
        BigNumber.from("0x2e3191a9"), //setResonate (single-use)
    ]
    
    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("Address Lock Proxy Set")

    //OutputReceiverProxy
    contracts = [
        orp,
        orp,
        orp,
        orp
    ]

    owners = [
        deployer,
        multisig,
        sevendayTimelock,
        sevendayTimelock
    ]

    selectors = [
        BigNumber.from("0x2e3191a9"), //setResonate (single-use)
        BigNumber.from("0xfe762024"), //setMetadataHandler 
        BigNumber.from("0xf91ad22e"), //updateRevestVariables
        BigNumber.from("0xf2fde38b") //transferOwnership
    ]

    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("OutputReceiverProxy Set")

    //ResonateHelper
    contracts = [
        resonateHelper,
        resonateHelper,
        resonateHelper,
        resonateHelper,
        resonateHelper,
        resonateHelper,
        resonateHelper,
        resonateHelper,
        resonateHelper
    ]

    owners = [
        deployer, //                                0
        multisig, // ultimately, 3-day timelock     1
        multisig, //                                2
        threedayTimelock,   //                      3
        threedayTimelock,   //                      4
        threedayTimelock,   //                      5
        team,       //                              6
        sandwichBot,                          //    7
        sandwichBot                           //    8
    ]

    selectors = [
        BigNumber.from("0x2e3191a9"), //setResonate (single-use) -  0
        BigNumber.from("0x2edbad45"), //repairGlass -               1
        BigNumber.from("0x38dece93"), //blacklistFunction -         2
        BigNumber.from("0xcd5c9917"), //whiteListFunction -         3
        BigNumber.from("0x2f2ff15d"), //grantRole                   4
        BigNumber.from("0xd547741f"), //revokeRoll                  5
        BigNumber.from("0x12cf6ff1"), //breakGlass                  6   
        BigNumber.from("0xb47bea2e"), //proxyCall                   7
        BigNumber.from("0x1442d4ed"), //sandwichSnapshot            8
    ]

    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("ResonateHelper Set")

    contracts = [
        sandwichBotProxy,
        sandwichBotProxy,
        sandwichBotProxy,
        sandwichBotProxy,
        sandwichBotProxy
    ]

    owners = [
        threedayTimelock,
        threedayTimelock,
        multisig,
        multisig,
        multisig
    ]

    selectors = [
        BigNumber.from("0x1717365d"), //setResonateHelper
        BigNumber.from("0x2f2ff15d"), //grantRole
        BigNumber.from("0xd547741f"), //revokeRoll
        BigNumber.from("0xb47bea2e"), //proxyCall
        BigNumber.from("0x1442d4ed"), //sandwichSnapshot
    ]

    //TODO - Roles within the contract
    tx = await govController.batchRegisterFunctions(contracts, owners, selectors);
    await tx.wait()
    console.log("SandwichBotProxy Set")


    //transfer ownership of resonate
    const resonateFactory = await ethers.getContractFactory("Resonate")
    const resonateCon = resonateFactory.attach(resonate)
    tx = await resonateCon.transferOwnership(govController.address)
    await tx.wait();

    //Transfer ownership of resonate helper
    const resonateHelperFactory = await ethers.getContractFactory("ResonateHelper")
    const resonateHelperCon = resonateHelperFactory.attach(resonateHelper)

    // Assumes signer[0] is previous owner
    const previousOwner = owner.address;

    const DEFAULT_ADMIN_ROLE = await resonateHelperCon.DEFAULT_ADMIN_ROLE();
    const BREAKER = await resonateHelperCon.BREAKER();
    const ADMIN = await resonateHelperCon.ADMIN();
    
    tx = await resonateHelperCon.grantRole(DEFAULT_ADMIN_ROLE, govController.address);
    await tx.wait();

    tx = await resonateHelperCon.grantRole(BREAKER, govController.address);
    await tx.wait();

    tx = await resonateHelperCon.grantRole(ADMIN, govController.address);
    await tx.wait();

    tx = await resonateHelperCon.renounceRole(DEFAULT_ADMIN_ROLE, previousOwner);
    await tx.wait();
    tx = await resonateHelperCon.renounceRole(BREAKER, previousOwner)
    await tx.wait();
    tx = await resonateHelperCon.renounceRole(ADMIN, previousOwner)
    await tx.wait();
    tx = await resonateHelperCon.renounceRole(ADMIN, previousOwner)
    await tx.wait();

    const priceProviderFactory = await ethers.getContractFactory("PriceProvider")
    const priceProviderCon = priceProviderFactory.attach(priceProvider)
    tx = await priceProviderCon.transferOwnership(govController.address)
    await tx.wait()

    const whitelistFactory = await ethers.getContractFactory("SmartWalletWhitelistV2")
    const whitelistCon = whitelistFactory.attach(smartWalletWhitelist)
    tx = await whitelistCon.changeAdmin(admin,true)
    await tx.wait()

    // Assign admin to multisig for smart wallet whitelist
    tx = await whitelistCon.changeAdmin(multisig,true);
    await tx.wait();

    // Assign admin to deployer for smart wallet whitelist
    tx = await whitelistCon.changeAdmin(deployer,true);
    await tx.wait();

    // Transfer ownership 
    tx = await whitelistCon.transferSuperAdmin(govController.address)
    await tx.wait()

    const orpFactory = await ethers.getContractFactory("OutputReceiverProxy")
    const orpCon = orpFactory.attach(orp)
    tx = await orpCon.transferOwnership(govController.address)
    await tx.wait()

    const alpFactory = await ethers.getContractFactory("AddressLockProxy")
    const alpCon = alpFactory.attach(alp)
    tx = await alpCon.transferOwnership(govController.address)
    await tx.wait()

    const sandwichFactory = await ethers.getContractFactory("SandwichBotProxy")
    const sandwichCon = sandwichFactory.attach(sandwichBotProxy)

    //Grant Roles to Gov Controller

    const VOTER = await sandwichCon.VOTER();
    const CALLER = await sandwichCon.CALLER();

    tx = await sandwichCon.grantRole(VOTER, govController.address);
    await tx.wait();
    tx = await sandwichCon.grantRole(ADMIN, govController.address);
    await tx.wait();
    tx = await sandwichCon.grantRole(CALLER, govController.address);
    await tx.wait();
    tx = await sandwichCon.grantRole(DEFAULT_ADMIN_ROLE, govController.address);
    await tx.wait();


    //Revoke all other roles
    const originalOwner = owner.address;
    const previousAdmin = owner.address;
    tx = await sandwichCon.renounceRole(VOTER, originalOwner);
    await tx.wait();

    tx = await sandwichCon.renounceRole(ADMIN, originalOwner);
    await tx.wait();

    tx = await sandwichCon.renounceRole(CALLER, originalOwner);
    await tx.wait();

    tx = await sandwichCon.renounceRole(DEFAULT_ADMIN_ROLE, originalOwner);
    await tx.wait();

    tx = await govController.transferAdmin(multisig);
    await tx.wait();

    console.log("\tScript complete, governance in effect. Please verify function before transferring govController to 7 day")
    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
