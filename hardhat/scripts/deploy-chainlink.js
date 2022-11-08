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
    250: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666",
    31337: "0x529Cb7fcD03A0cCE4E0E7B8E4d11649626769666"
}

const CHAINLINK_USD = {
    1:'',
    4:"",
    137:"",
    250:"0x11ddd3d147e5b83d01cee7070027092397d63658",
    43114:"",
    31337:'0xd2c6eB7527Ab1E188638B86F2c14bbAd5A431d78',
}

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    console.log(SEPERATOR);
    console.log("Deploying Chainlink USD Oracle")
    const chainlinkUSDFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const ChainlinkUSD = await chainlinkUSDFactory.deploy(PRICE_PROVIDERS[chainId], CHAINLINK_USD[chainId]);
    await ChainlinkUSD.deployed();

    // We use address(0) for ETH-based feeds
    /* No need for ETH-based fees right now
    console.log(SEPERATOR);
    console.log("Deploying Chainlink ETH Oracle")
    const chainlinkETHFactory = await ethers.getContractFactory("ChainlinkPriceOracle")
    const ChainlinkETH = await chainlinkUSDFactory.deploy(PRICE_PROVIDERS[chainId], ethers.constants.AddressZero);
    await ChainlinkETH.deployed();*/

    console.log(SEPERATOR);

    for(let i = 0; i < USD_PRICE_FEEDS[chainId].length; i++) {
        let obj = USD_PRICE_FEEDS[chainId][i];
        let tx = ChainlinkUSD.setPriceFeed(obj.TOKEN, obj.FEED);
        await tx.wait();
        console.log("\tSuccessfully registered feed: ",i);
    }

    console.log("\tDeployment Completed.\n");
    console.log(`\tChainlink Oracle: ${SimpleOracle.address}`)

   
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
