import React, { useContext, useEffect, useState } from "react";
import { Context } from "../Context";
import { DateTime } from "luxon";
import {
  parseEther,
  parseUnits,
  formatEther,
  formatUnits,
} from "ethers/lib/utils";

export function Goal() {
  const { goal } = useContext(Context);

  return <div>{goal ? ActiveGoal() : CreateGoal()}</div>;
}

export function CreateGoal() {
  const { contracts, eth, linkedAddress, goal, setGoal } = useContext(Context);
  const [stakeValue, setStakeValue] = useState<string>("");
  const [distanceValue, setDistanceValue] = useState<string>("");
  const [deadlineValue, setDeadlineValue] = useState<string>("");

  const onClick = () => {
    const createGoal = async () => {
      if (eth && contracts && setGoal) {
        let stakeWei = parseEther(stakeValue);
        let distanceInMeters = Number.parseInt(distanceValue) * 1000;
        let distanceWei = parseUnits(distanceInMeters.toString(), "wei");
        let deadlineTimestamp = DateTime.fromISO(deadlineValue).toSeconds();
        let { signer } = eth;
        await contracts.dai
          .connect(signer)
          .approve(contracts.goalManager.address, stakeWei);
        await contracts.goalManager
          .connect(signer)
          .createGoal(distanceWei, stakeWei, deadlineTimestamp, "abc123");
        let goalId = await contracts.goalManager.goalsByStaker(linkedAddress);
        let [_id, _pos, staker, target, stake, created, expires] =
          await contracts.goalManager.goals(goalId);
        setGoal({
          staker: staker,
          target: target,
          stake: stake,
          created: created,
          expires: expires,
        });
      }
    };
    createGoal();
  };

  return (
    <div className="max-w-4xl grid grid-cols-1 gap-2">
      <div>
        <label className="text-pink-600 font-semibold">Stake</label>
        <div className="relative flex w-full flex-wrap items-stretch mb-3">
          <input
            onChange={(e) => {
              setStakeValue(e.target.value);
            }}
            type="text"
            placeholder="500"
            className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pr-10"
          />
          <span className="z-10 h-full leading-snug font-normal absolute text-center absolute bg-transparent rounded text-sm items-center justify-center w-8 right-0 pr-3 py-3">
            DAI
          </span>
        </div>
      </div>
      <div>
        <label className="text-pink-600 font-semibold">Distance</label>
        <div className="relative flex w-full flex-wrap items-stretch mb-3">
          <input
            onChange={(e) => {
              setDistanceValue(e.target.value);
            }}
            type="text"
            placeholder="100"
            className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pr-10"
          />
          <span className="z-10 h-full leading-snug font-normal absolute text-center absolute bg-transparent rounded text-sm items-center justify-center w-8 right-0 pr-3 py-3">
            km
          </span>
        </div>
      </div>
      <div>
        <label className="text-pink-600 font-semibold">Deadline</label>
        <div className="relative flex w-full flex-wrap items-stretch mb-3">
          <input
            onChange={(e) => {
              setDeadlineValue(e.target.value);
            }}
            type="datetime-local"
            className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
          />
        </div>
      </div>
      <button
        onClick={onClick}
        className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
      >
        Create Goal
      </button>
    </div>
  );
}

export function ActiveGoal() {
  const { contracts, eth, linkedAddress, goal, setGoal } = useContext(Context);

  const onClick = () => {
    const redeemGoal = async () => {
      if (eth && contracts && setGoal) {
        let { signer } = eth;
        let goalId = await contracts?.goalManager.goalsByStaker(linkedAddress);
        let newGoal = await contracts?.goalManager
          .connect(signer)
          .redeemGoal(goalId);
        setGoal(undefined);
      }
    };
    redeemGoal();
  };

  return (
    <div>
      {goal && (
        <div className="max-w-4xl grid grid-cols-1 gap-2">
          <div>
            <label className="text-pink-600 font-semibold">Stake</label>
            <div className="relative flex w-full flex-wrap items-stretch mb-3">
              <p>{formatEther(goal.stake)} DAI</p>
            </div>
          </div>
          <div>
            <label className="text-pink-600 font-semibold">Distance</label>
            <div className="relative flex w-full flex-wrap items-stretch mb-3">
              <p>{formatUnits(goal.target.div(1000), "wei")} km</p>
            </div>
          </div>
          <div>
            <label className="text-pink-600 font-semibold">Deadline</label>
            <div className="relative flex w-full flex-wrap items-stretch mb-3">
              <p>
                {DateTime.fromSeconds(goal.expires.toNumber()).toRelative()}
              </p>
            </div>
          </div>
          <button
            onClick={onClick}
            className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
          >
            Complete Goal
          </button>
        </div>
      )}
    </div>
  );
}
