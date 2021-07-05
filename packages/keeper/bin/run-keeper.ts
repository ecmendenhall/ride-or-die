import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { BigNumberish, ethers } from "ethers";
import { DateTime } from "luxon";
import eth from "../src/eth";

const scheduler = new ToadScheduler();

const runKeeper = async () => {
  console.log("Running Keeper...");
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
    let expiresTimestamp = ethers.utils.formatUnits(expires, "wei");
    let [progress, updated] = await goalOracle.progress(staker);
    console.log("Staker: ", staker);
    console.log("Goal: ", ethers.utils.formatUnits(target, "wei"));
    console.log(
      "Current progress: ",
      ethers.utils.formatUnits(progress, "wei")
    );
    console.log("Expires: ", expiresTimestamp);

    if (DateTime.now() > DateTime.fromSeconds(parseInt(expiresTimestamp))) {
      console.log("Found expired goal: ", id);
      if (progress < target) {
        console.log("Liquidating failed goal: ", id);
        await goalManager.connect(signer).liquidateGoal(id);
      }
    }
  });
};

const task = new AsyncTask(
  "Ride or Die Keeper",
  () => {
    return runKeeper();
  },
  (err: Error) => {
    console.log(err);
  }
);
const job = new SimpleIntervalJob({ seconds: 30 }, task);

scheduler.addSimpleIntervalJob(job);
