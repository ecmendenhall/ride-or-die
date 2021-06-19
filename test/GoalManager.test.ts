import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";


describe("GoalManager", function() {

  let goalManager;
  let goalSetter;

  before(async function() {
    [goalSetter] = await ethers.getSigners();

    const GoalManager = await ethers.getContractFactory("GoalManager");
    goalManager = await GoalManager.deploy();
  });

  it("Maps addresses to goals", async function() {
    await goalManager.connect(goalSetter).createGoal(100, parseEther("2500"));
    let [target, _stake,  _created, _expires] = await goalManager.goals(goalSetter.address);

    expect(target).to.equal(100);
  });

  it("Goals have an expiration", async function() {
    await goalManager.connect(goalSetter).createGoal(100, parseEther("2500"));
    let [_target, _stake, created, expires] = await goalManager.goals(goalSetter.address);

    expect(expires - created).to.equal(30 * 24 * 60 * 60);
  });

  it("Goals have a stake", async function() {
    await goalManager.connect(goalSetter).createGoal(100, parseEther("2500"));
    let [_target, stake, _created, _expires] = await goalManager.goals(goalSetter.address);

    expect(stake).to.equal(parseEther("2500"));
  });

});
