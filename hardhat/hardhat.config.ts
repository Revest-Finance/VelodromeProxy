import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import * as tdly from "@tenderly/hardhat-tenderly";

// This line will break testing – but should be uncommented for deployments
//tdly.setup();

const dotenv = require("dotenv");

import { HardhatUserConfig } from "hardhat/config";

dotenv.config({path: __dirname + '/.env'});

// Ensure that we have all the environment variables we need.
let PRIVATE_KEY: string;
let TESTING_PRIVATE: string;
if (!process.env.hasOwnProperty("PRIVATE_KEY")) {
    // throw new Error("Please set your PRIVATE_KEY in a .env file");
    PRIVATE_KEY = '';
    console.log("WRONG PRIVATE KEY");
} else {
    PRIVATE_KEY = String(process.env.PRIVATE_KEY);
    TESTING_PRIVATE = String(process.env.TESTING_PRIVATE);
}

const config = {
    defaultNetwork: "hardhat",
    gasReporter: {
        currency: "USD",
        src: "./contracts",
        gasPrice: 30,
        ethPrice: 1200.16
    },
    networks: {
        hardhat: {
            hardfork: "london",
            initialBaseFeePerGas: 0,
            forking: {
                url: "https://eth-mainnet.alchemyapi.io/v2/zOVFUzSEld1v_MuTOqGPYkTYttwBUrmF",
                blockNumber: 15133322,
            },
            allowUnlimitedContractSize: true
        },
        rinkeby: {
            url: "https://eth-rinkeby.alchemyapi.io/v2/srVBZIhy3PWWN1URQfd-KlTJk8q964kr",
            accounts: [
                "",
            ],
        },
        mainnet: {
            url: "https://eth-mainnet.alchemyapi.io/v2/zOVFUzSEld1v_MuTOqGPYkTYttwBUrmF",
            accounts: [PRIVATE_KEY],
            gasPrice: 25e9,
            blockGasLimit: 12487794,
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc	",
            accounts: [PRIVATE_KEY],
            gasPrice: 0.1e9,
            chainId: 42161,
            blockGasLimit: 12487794,
        },
        matic: {
            url: "https://polygon-mainnet.g.alchemy.com/v2/XZF2U-6qLByJKH9OVsB8rflwSYaZRQaq",
            accounts: [PRIVATE_KEY],
            gasPrice: 45e9,
            chainId: 137,
            blockGasLimit: 12487794,
        },
        optimism: {
            url: "https://mainnet.optimism.io	",
            accounts: [PRIVATE_KEY],
            gasPrice: 1e7,
            chainId: 10,
            blockGasLimit: 12487794,
        },
        fantom: {
            url: "https://rpc.ftm.tools/",
            accounts: [PRIVATE_KEY],
            gasPrice: 5e9,
            chainId: 250,
            blockGasLimit: 12487794,
        },
        avax: {
            url: "https://api.avax.network/ext/bc/C/rpc",
            accounts: [PRIVATE_KEY],
            gasPrice: 75e9,
            chainId: 43114,
            blockGasLimit: 12487794,
        }
    },
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test",
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: true,
        disambiguatePaths: false,
    },
    solidity: {
        version: "0.8.13",
        settings: {
            metadata: {
                // Not including the metadata hash
                // https://github.com/paulrberg/solidity-template/issues/31
                bytecodeHash: "none",
            },
            // You should disable the optimizer when debugging
            // https://hardhat.org/hardhat-network/#solidity-optimizer-support
            optimizer: {
                enabled: true,
                runs: 100,
            },
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: {
          mainnet: "CD6S4FNXAPRUE582YPRIWRIN9KKJ2YJC5A",
          rinkeby: "CD6S4FNXAPRUE582YPRIWRIN9KKJ2YJC5A",
          opera: "USUCFDWAS8AWNDAGTITU7VZNWPIBR6ERYV",
          polygon: "8D8PEFUW8PAXWFUMFAZFXJPQ8DCM1BGEV9",
          avalanche: "FHIADV6UMVKFNAXWJ7K1BYZZR3SB1EWRWB",
          optimisticEthereum:"ZNEYB7GKFMKQ44K82DF6U4KQIART6D46TY",
          arbitrumOne:"HKS9HPIVFSS7SWWGRUACUX8Z96MEJTXQAS"
      },
    },
    mocha: {
        timeout: 60000,
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
};

export default config;
