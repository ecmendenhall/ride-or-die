import React from "react";

export function Staking() {
  return (
    <div>
      <div>
        <label className="text-pink-600 font-semibold">Vault</label>
        <div className="mb-2">
          <p>12.3 RIDE-sdCrv</p>
          <p>11.3 DAI</p>
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
          <p>12.3 RIDE-sdCrv</p>
          <p>11.3 DAI</p>
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
