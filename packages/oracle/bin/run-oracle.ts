import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { BigNumberish, ethers } from "ethers";
import api from "../src/api";
import eth from "../src/eth";

const scheduler = new ToadScheduler();

const runOracle = async () => {
  console.log("Running Oracle...");
  const { provider, signer } = await eth.createProvider();
  const { goalManager, goalOracle } = await eth.loadContracts(provider);
  console.log("Signer: ", await signer.getAddress());
  console.log("Balance: ", ethers.utils.formatEther(await signer.getBalance()));

  console.log("Loading active goals...");
  let active = await goalManager.activeGoals();
  console.log(
    "Active goals: ",
    active.map((g: BigNumberish) => ethers.utils.formatUnits(g, "wei"))
  );
  active.forEach(async (id: number) => {
    let [_id, pos, staker, target, stake, created, expires] =
      await goalManager.goals(id);
    let createdTimestamp = ethers.utils.formatUnits(created, "wei");
    let expiresTimestamp = ethers.utils.formatUnits(expires, "wei");
    let currentProgress = await api.getProgress(
      staker,
      createdTimestamp,
      expiresTimestamp
    );
    console.log("Staker: ", staker);
    console.log("Goal: ", ethers.utils.formatUnits(target, "wei"));
    console.log("Current progress: ", currentProgress);
    console.log("Created: ", createdTimestamp);
    console.log("Expires: ", expiresTimestamp);
    console.log("Writing progress to Oracle contract...");
    goalOracle
      .connect(signer)
      .setGoalProgress(
        staker,
        ethers.utils.parseUnits(Math.round(currentProgress).toString(), "wei")
      );
  });
};

const task = new AsyncTask(
  "Ride or Die Oracle",
  () => {
    return runOracle();
  },
  (err: Error) => {
    console.log(err);
  }
);
const job = new SimpleIntervalJob({ seconds: 30 }, task);

scheduler.addSimpleIntervalJob(job);
