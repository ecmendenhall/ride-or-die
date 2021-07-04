import { ethers } from "ethers";
import config from "../config";

declare const window: any;

const connect = async () => {
  let [activeAddress] = await window.ethereum.enable();
  return activeAddress as string;
};

const createProvider = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

const loadContracts = (provider: ethers.providers.Web3Provider) => {
  return {
    dai: getDaiContract(provider),
    goalManager: getGoalManagerContract(provider),
    vault: getVaultContract(provider),
  };
};

const getDaiContract = (provider: ethers.providers.Web3Provider) => {
  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint)",
    "function approve(address spender, uint amount)",
  ];
  return new ethers.Contract(config.contracts.dai.address, abi, provider);
};

const getGoalManagerContract = (provider: ethers.providers.Web3Provider) => {
  return new ethers.Contract(
    config.contracts.goalManager.address,
    config.contracts.goalManager.abi,
    provider
  );
};

const getVaultContract = (provider: ethers.providers.Web3Provider) => {
  return new ethers.Contract(
    config.contracts.vault.address,
    config.contracts.vault.abi,
    provider
  );
};

const exports = {
  connect: connect,
  createProvider: createProvider,
  loadContracts: loadContracts,
};

export default exports;
