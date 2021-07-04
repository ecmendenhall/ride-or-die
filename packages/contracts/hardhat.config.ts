import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.3"
      },
      {
        version: "0.6.6"
      }
    ]
  },
  networks: {
    rinkeby: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY_RINKEBY}`,
      accounts: {
        mnemonic: process.env.RINKEBY_MNEMONIC
      }
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY_ROPSTEN}`,
      accounts: {
        mnemonic: process.env.ROPSTEN_MNEMONIC
      }
    },
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY_MAINNET}`,
        enabled: true,
      },
    },
  },
};
