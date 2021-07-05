import { ethers, network } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { Vault, GoalManager, GoalOracle } from "../typechain";

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const STAKEDAO_VAULT = "0xB17640796e4c27a39AF51887aff3F8DC0daF9567";
const THREE_CRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const THREE_POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const CHAINLINK_NODE = "0xa12Ee240E68eC2058C93C2a0159636B9D9C8aB79";
const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const DEMO_ACCOUNT = "0x79d31bFcA5Fda7A4F15b36763d2e44C99D811a6C";

async function main() {
  const [owner] = await ethers.getSigners();

  const GoalOracle = await ethers.getContractFactory("GoalOracle");
  let goalOracle = await GoalOracle.deploy();
  console.log("GoalOracle deployed to:", goalOracle.address);

  const Deadpool = await ethers.getContractFactory("Deadpool");
  let deadpool = await Deadpool.deploy(STAKEDAO_VAULT);
  console.log("Deadpool deployed to:", deadpool.address);

  const Vault = await ethers.getContractFactory("Vault");
  let vault = await Vault.deploy(
    STAKEDAO_VAULT,
    DAI,
    THREE_CRV,
    THREE_POOL,
    deadpool.address
  );
  console.log("Vault deployed to:", vault.address);

  const GoalManager = await ethers.getContractFactory("GoalManager");
  let goalManager = await GoalManager.deploy(
    DAI,
    vault.address,
    goalOracle.address,
    deadpool.address
  );
  console.log("GoalManager deployed to:", goalManager.address);

  await vault.connect(owner).transferOwnership(goalManager.address);
  await deadpool.connect(owner).transferOwnership(goalManager.address);

  const Faucet = await ethers.getContractFactory("Faucet");
  let faucet = await Faucet.deploy(UNISWAP_ROUTER);
  console.log("Faucet deployed to:", faucet.address);

  await network.provider.send("hardhat_setBalance", [
    faucet.address,
    "0x152d02c7e14af6800000", // 100k ETH
  ]);
  await faucet.sendTokens(DAI, DEMO_ACCOUNT);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
