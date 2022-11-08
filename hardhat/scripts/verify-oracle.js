const hre = require("hardhat");
const ethers = hre.ethers;

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

// Current is Fantom Opera deployment

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let snapshot = require('./data/snapshot' + chainId + '.json');

    let ResonateAddressRegistry = PROVIDERS[chainId];

    let ORACLE = "0x7F0027dB747E97750032495f7672E3569011A523";
    
    
    await run("verify:verify", {
        address: ORACLE,
        constructorArguments: [
            PRICE_PROVIDERS[chainId]
        ],
    })
    
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
