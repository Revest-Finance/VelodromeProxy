const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const { curve } = require("elliptic");

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

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    console.log("OWNER: " + owner.address)
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let snapshot = require('../data/snapshot' + chainId + '.json');

    const devWallet = snapshot['DevWallet'] 
    const priceProvider = snapshot['PriceProvider'];
    const resonate = snapshot['Resonate'];
    const chainlinkOracleAddr = snapshot['Chainlink'];

    const usdc = "0x7f5c764cbc14f9669b88837ca1490cca17c31607"
    const susd = "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
    const snx = "0x8700daec35af8ff88c16bdf0418774cb3d7599b4"
    const usdt = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
    const dai = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
    const weth = "0x4200000000000000000000000000000000000006"
    const op = "0x4200000000000000000000000000000000000042"

    const TWAPFactory = await ethers.getContractFactory("VelodromeTWAP")
    const veloFactory = "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746"
    const twap = await TWAPFactory.deploy(priceProvider, usdc, weth, veloFactory);
    await twap.deployed();
    console.log(`VELO TWAP Deployed: ${twap.address}`)
    await run("verify:verify", {
        address: twap.address,
        constructorArguments: [priceProvider, usdc, weth, veloFactory],
    })

    const mai = "0xdFA46478F9e5EA86d57387849598dbFB2e964b02"
    const velo = "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05"
    tx = await twap.initializeOracle(mai, true)
    await tx.wait()

    tx = await twap.initializeOracle(velo, false)
    await tx.wait()

   
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Deployment Error.\n\n----------------------------------------------\n");
        console.error(error);
        process.exit(1);
    })
