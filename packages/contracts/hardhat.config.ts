import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        enabled: false,
      },
    },
  },
};
