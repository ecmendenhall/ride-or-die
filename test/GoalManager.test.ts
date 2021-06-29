import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

describe("GoalManager", function () {
  const STAKE_AMOUNT = parseEther("2500");
  const IPFS_CID =
    "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

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
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, IPFS_CID);
      let [target, stake, created, expires] = await goalManager.goals(1);

      expect(target).to.equal(100);
      expect(expires - created).to.equal(30 * 24 * 60 * 60);
      expect(stake).to.equal(STAKE_AMOUNT);
    });

    describe("Stake transfers", async function () {
      it("When creating a Goal, the stake is transferred from the user's account", async function () {
        let initialBalance = await mockDai.balanceOf(goalSetter.address);
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, IPFS_CID);
        let newBalance = await mockDai.balanceOf(goalSetter.address);

        expect(newBalance).to.equal(
          BigNumber.from(initialBalance).sub(STAKE_AMOUNT)
        );
      });

      it("Reverts if user balance is less than stake amount", async function () {
        let overStake = STAKE_AMOUNT.add(parseEther("1"));
        mockDai.connect(goalSetter).approve(goalManager.address, overStake);
        await expect(
          goalManager.connect(goalSetter).createGoal(100, overStake, IPFS_CID)
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Reverts if goal is already set", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT.div(2), IPFS_CID);
        await expect(
          goalManager
            .connect(goalSetter)
            .createGoal(100, STAKE_AMOUNT.div(2), IPFS_CID)
        ).to.be.revertedWith("Goal already set");
      });
    });

    describe("Goal tokens", async function () {
      it("Returns an ERC721 token to the goal setter", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, IPFS_CID);
        expect(await goalManager.balanceOf(goalSetter.address)).to.equal(1);
      });

      it("Sets token URI", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, IPFS_CID);
        expect(await goalManager.tokenURI(1)).to.equal(IPFS_CID);
      });
    });
  });

  describe("Redeeming completed goals", async function () {
    it("Burns the goal token", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, IPFS_CID);
      await goalManager.connect(goalSetter).redeemGoal(1);
      expect(await goalManager.balanceOf(goalSetter.address)).to.equal(0);
    });

    it("Deletes the goal data", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, IPFS_CID);
      await goalManager.connect(goalSetter).redeemGoal(1);
      let [target, stake, created, expires] = await goalManager.goals(1);
      expect(target).to.equal(0);
      expect(stake).to.equal(0);
      expect(created).to.equal(0);
      expect(expires).to.equal(0);
    });
  });

  describe("Liquidating failed goals", async function () {
    it("Burns the goal token", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, IPFS_CID);
      await goalManager.connect(goalSetter).liquidateGoal(1);
      expect(await goalManager.balanceOf(goalSetter.address)).to.equal(0);
    });

    it("Deletes the goal data", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, IPFS_CID);
      await goalManager.connect(goalSetter).liquidateGoal(1);
      let [target, stake, created, expires] = await goalManager.goals(1);
      expect(target).to.equal(0);
      expect(stake).to.equal(0);
      expect(created).to.equal(0);
      expect(expires).to.equal(0);
    });
  });
});
