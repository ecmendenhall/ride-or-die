import { ethers } from "ethers";
import config from "./config";

const createProvider = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    config.provider.RPC_CONNECTION
  );
  const signer = await provider.getSigner();
  return { provider, signer };
};

const loadContracts = (provider: ethers.providers.JsonRpcProvider) => {
  return {
    goalManager: getGoalManagerContract(provider),
    goalOracle: getGoalOracleContract(provider),
  };
};

const getGoalManagerContract = (provider: ethers.providers.JsonRpcProvider) => {
  return new ethers.Contract(
    config.contracts.goalManager.address,
    config.contracts.goalManager.abi,
    provider
  );
};

const getGoalOracleContract = (provider: ethers.providers.JsonRpcProvider) => {
  return new ethers.Contract(
    config.contracts.goalOracle.address,
    config.contracts.goalOracle.abi,
    provider
  );
};

const eth = {
  createProvider: createProvider,
  loadContracts: loadContracts,
};

export default eth;
