import { ethers } from "hardhat";
import { Vault, GoalManager } from "../typechain";

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const STAKEDAO_VAULT = '0xB17640796e4c27a39AF51887aff3F8DC0daF9567';
const THREE_CRV = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';
const THREE_POOL = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';

async function main() {
  const [owner] = await ethers.getSigners();

  const Vault = await ethers.getContractFactory("Vault");
  let vault = await Vault.deploy(
    STAKEDAO_VAULT,
    DAI,
    THREE_CRV,
    THREE_POOL
  );
  console.log("Vault deployed to:", vault.address);

  const GoalManager = await ethers.getContractFactory("GoalManager");
  let goalManager = await GoalManager.deploy(
    DAI,
    vault.address
  );
  console.log("GoalManager deployed to:", goalManager.address);

  await vault.connect(owner).transferOwnership(goalManager.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
