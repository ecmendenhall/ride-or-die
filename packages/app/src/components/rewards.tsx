import { BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";
import React, { useContext } from "react";
import { Context } from "../Context";

const formatBalance = (balance: BigNumberish) => {
  return formatEther(balance).slice(0, 10);
};

export function Staking() {
  const { balances } = useContext(Context);

  return (
    <div>
      <div>
        <label className="text-pink-600 font-semibold">Vault</label>
        <div className="mb-2">
          <p>{formatBalance(balances?.vault || 0)} RIDE-sdCrv</p>
        </div>
      </div>
    </div>
  );
}

export function Deadpool() {
  const { eth, balances, contracts, linkedAddress, setBalances } =
    useContext(Context);

  const redeemDeadpoolShares = async () => {
    if (contracts && eth && setBalances) {
      let { signer } = eth;
      let { vault, deadpool } = contracts;
      let balance = await deadpool.balanceOf(linkedAddress);
      await deadpool.connect(signer).redeemShares(balance);
      let vaultBalance = await vault.balanceOf(linkedAddress);
      let deadpoolBalance = await deadpool.balanceOf(linkedAddress);
      let deadpoolSd3CrvBalance = await deadpool.shareValue(deadpoolBalance);
      setBalances({
        vault: vaultBalance,
        deadpool: deadpoolBalance,
        deadpoolSd3Crv: deadpoolSd3CrvBalance,
      });
    }
  };

  return (
    <div>
      <div>
        <label className="text-pink-600 font-semibold">Deadpool</label>
        <div className="mb-2">
          <p>{formatBalance(balances?.deadpool || 0)} DIE-sdCrv</p>
          <p>{formatBalance(balances?.deadpoolSd3Crv || 0)} sdCrv</p>
        </div>
      </div>
      <button
        onClick={redeemDeadpoolShares}
        className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
      >
        Claim
      </button>
    </div>
  );
}

export function Rewards() {
  return (
    <div className="grid grid-cols-1 gap-2">
      <Staking />
      <Deadpool />
    </div>
  );
}
