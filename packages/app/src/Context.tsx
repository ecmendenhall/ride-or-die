import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

import jwtDecode from "jwt-decode";
import { BigNumber } from "ethers";

import chain from "./lib/chain";

declare const window: any;

interface JWTPayload {
  address: string;
}

interface Eth {
  provider: ethers.providers.Web3Provider;
  signer: ethers.providers.JsonRpcSigner;
}

interface Contracts {
  dai: ethers.Contract;
  goalManager: ethers.Contract;
}

interface StravaProfile {
  imageURL: string;
  recentRides: number;
  thisYear: number;
  allTime: number;
}

interface Goal {
  staker: string;
  stake: BigNumber;
  target: BigNumber;
  created: BigNumber;
  expires: BigNumber;
}

interface IContext {
  ethEnabled: boolean;
  setEthEnabled: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  eth: Eth | undefined;
  setEth: React.Dispatch<React.SetStateAction<Eth | undefined>> | undefined;
  activeAddress: string | undefined;
  setActiveAddress:
    | React.Dispatch<React.SetStateAction<string | undefined>>
    | undefined;
  linkedAddress: string | undefined;
  setLinkedAddress:
    | React.Dispatch<React.SetStateAction<string | undefined>>
    | undefined;
  stravaProfile: StravaProfile | undefined;
  setStravaProfile:
    | React.Dispatch<React.SetStateAction<StravaProfile | undefined>>
    | undefined;
  contracts: Contracts | undefined;
  setContracts:
    | React.Dispatch<React.SetStateAction<Contracts | undefined>>
    | undefined;
  goal: Goal | undefined;
  setGoal: React.Dispatch<React.SetStateAction<Goal | undefined>> | undefined;
}

const context: IContext = {
  ethEnabled: false,
  setEthEnabled: undefined,
  eth: undefined,
  setEth: undefined,
  activeAddress: undefined,
  setActiveAddress: undefined,
  linkedAddress: undefined,
  setLinkedAddress: undefined,
  stravaProfile: undefined,
  setStravaProfile: undefined,
  contracts: undefined,
  setContracts: undefined,
  goal: undefined,
  setGoal: undefined,
};

export const Context = React.createContext(context);

export function Provider<T>({ children }: React.PropsWithChildren<T>) {
  const [ethEnabled, setEthEnabled] = useState<boolean>(false);
  const [eth, setEth] = useState<Eth>();
  const [activeAddress, setActiveAddress] = useState<string>();
  const [linkedAddress, setLinkedAddress] = useState<string>();
  const [stravaProfile, setStravaProfile] = useState<StravaProfile>();
  const [contracts, setContracts] = useState<Contracts>();
  const [goal, setGoal] = useState<Goal>();

  useEffect(() => {
    const connectChain = async () => {
      let activeAddress = await chain.connect();
      setActiveAddress(activeAddress);
      setEthEnabled(true);
      let eth = await chain.createProvider();
      setEth(eth);
      let contracts = await chain.loadContracts(eth.provider);
      setContracts(contracts);
    };
    connectChain();
    let token = window.localStorage.getItem("ride-or-die-token");
    if (token) {
      let { address }: JWTPayload = jwtDecode(token);
      setLinkedAddress(address);
    }
  }, []);

  return (
    <Context.Provider
      value={{
        ethEnabled,
        setEthEnabled,
        eth,
        setEth,
        activeAddress,
        setActiveAddress,
        linkedAddress,
        setLinkedAddress,
        stravaProfile,
        setStravaProfile,
        contracts,
        setContracts,
        goal,
        setGoal,
      }}
    >
      {children}
    </Context.Provider>
  );
}
