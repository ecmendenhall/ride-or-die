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
  return (
    <div>
      <div>
        <label className="text-pink-600 font-semibold">Deadpool</label>
        <div className="mb-2">
          <p>12.3 DIE-sdCrv</p>
        </div>
      </div>
      <button className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">
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
