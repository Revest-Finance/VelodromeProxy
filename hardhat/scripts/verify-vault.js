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

// Current is Fantom Opera deployment

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];//TODO: Change to multisig
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    let snapshot = require('./data/snapshot' + chainId + '.json');

    let ResonateAddressRegistry = PROVIDERS[chainId];

    let VAULT_1 = "0xc1a0d515F11B0FfB9973405cfb003dDABD643c44";
    let VAULT_2 = "0x8decc58FeD46B9931f65b1c223F0905e2Fe59D21";

    
    const YEARN_VAULT_1 = "0x91155c72ea13BcbF6066dD161BECED3EB7c35e35";
    const YEARN_VAULT_2 = "0xFC550BAD3c14160CBA7bc05ee263b3F060149AFF";


    
    await run("verify:verify", {
        address: VAULT_1,
        constructorArguments: [
            YEARN_VAULT_1
        ],
    })

    await run("verify:verify", {
        address: VAULT_2,
        constructorArguments: [
            YEARN_VAULT_2
        ],
    })
    
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
