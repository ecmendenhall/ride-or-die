import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

describe("GoalManager", function () {
  const STAKE_AMOUNT = parseEther("2500");

  let goalSetter;
  let mockDai;
  let goalManager;

  beforeEach(async function () {
    [goalSetter] = await ethers.getSigners();

    const MockDai = await ethers.getContractFactory("MockERC20");
    mockDai = await MockDai.deploy("Mock Dai", "DAI");

    const GoalManager = await ethers.getContractFactory("GoalManager");
    goalManager = await GoalManager.deploy(mockDai.address);

    await mockDai.burnFrom(
      goalSetter.address,
      mockDai.balanceOf(goalSetter.address)
    );
    await mockDai.mint(goalSetter.address, STAKE_AMOUNT);
    await mockDai
      .connect(goalSetter)
      .approve(goalManager.address, STAKE_AMOUNT);
  });

  describe("Contract setup", async function () {
    it("Supports ERC20 Token Address", async function () {
      expect(await goalManager.token()).to.equal(mockDai.address);
    });
  });

  describe("Creating goals", async function () {
    it("Creates a new goal for user", async function () {
      await goalManager.connect(goalSetter).createGoal(100, STAKE_AMOUNT);
      let [target, stake, created, expires] = await goalManager.goals(
        goalSetter.address
      );

      expect(target).to.equal(100);
      expect(expires - created).to.equal(30 * 24 * 60 * 60);
      expect(stake).to.equal(STAKE_AMOUNT);
    });

    describe("Stake transfers", async function () {
      it("When creating a Goal, the stake is transferred from the user's account", async function () {
        let initialBalance = await mockDai.balanceOf(goalSetter.address);
        await goalManager.connect(goalSetter).createGoal(100, STAKE_AMOUNT);
        let newBalance = await mockDai.balanceOf(goalSetter.address);

        expect(newBalance).to.equal(
          BigNumber.from(initialBalance).sub(STAKE_AMOUNT)
        );
      });

      it("Reverts if user balance is less than stake amount", async function () {
        let overStake = STAKE_AMOUNT.add(parseEther("1"));
        mockDai.connect(goalSetter).approve(goalManager.address, overStake);
        await expect(
          goalManager.connect(goalSetter).createGoal(100, overStake)
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Reverts if goal is already set", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT.div(2));
        await expect(
          goalManager.connect(goalSetter).createGoal(100, STAKE_AMOUNT.div(2))
        ).to.be.revertedWith("Goal already set");
      });
    });
  });
});
