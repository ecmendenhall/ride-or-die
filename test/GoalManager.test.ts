import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

describe("GoalManager", function () {
  const STAKE_AMOUNT = parseEther("2500");

  let goalSetter;
  let mockDai;
  let goalManager;

  before(async function () {
    [goalSetter] = await ethers.getSigners();

    const MockDai = await ethers.getContractFactory("MockDai");
    mockDai = await MockDai.deploy();

    const GoalManager = await ethers.getContractFactory("GoalManager");
    goalManager = await GoalManager.deploy(mockDai.address);
  });

  beforeEach(async function () {
    mockDai.mint(goalSetter.address, STAKE_AMOUNT);
    mockDai.connect(goalSetter).approve(goalManager.address, STAKE_AMOUNT);
  });

  it("Creates a new goal for user", async function () {
    await goalManager.connect(goalSetter).createGoal(100, STAKE_AMOUNT);
    let [target, stake, created, expires] = await goalManager.goals(
      goalSetter.address
    );

    expect(target).to.equal(100);
    expect(expires - created).to.equal(30 * 24 * 60 * 60);
    expect(stake).to.equal(STAKE_AMOUNT);
  });

  it("Supports ERC20 Token Address", async function () {
    expect(await goalManager.token()).to.equal(mockDai.address);
  });

  it("When creating a Goal, the stake is transferred from the user's account", async function () {
    let initialBalance = await mockDai.balanceOf(goalSetter.address);
    await goalManager.connect(goalSetter).createGoal(100, STAKE_AMOUNT);
    let newBalance = await mockDai.balanceOf(goalSetter.address);

    expect(newBalance).to.equal(
      BigNumber.from(initialBalance).sub(STAKE_AMOUNT)
    );
  });
});
