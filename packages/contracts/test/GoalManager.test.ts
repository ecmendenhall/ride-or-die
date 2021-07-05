import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  MockERC20,
  GoalManager,
  MockCurve3Pool,
  MockStakeDAOVault,
  GoalOracle,
  Vault,
} from "../typechain";

describe("GoalManager", function () {
  const STAKE_AMOUNT = parseEther("2500");
  const IPFS_CID =
    "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
  const DEADLINE = 1625436118;

  let owner: SignerWithAddress;
  let goalSetter: SignerWithAddress;
  let mockCurve3Pool: MockCurve3Pool;
  let mockStakeDAOvault: MockStakeDAOVault;
  let vault: Vault;
  let goalOracle: GoalOracle;
  let mockDai: MockERC20;
  let mock3crv: MockERC20;
  let goalManager: GoalManager;

  beforeEach(async function () {
    [owner, goalSetter] = await ethers.getSigners();

    const MockDai = await ethers.getContractFactory("MockERC20");
    mockDai = await MockDai.deploy("Mock Dai", "DAI");

    const Mock3Crv = await ethers.getContractFactory("MockERC20");
    mock3crv = await Mock3Crv.deploy("Mock 3Crv", "3Crv");

    const MockCurve3Pool = await ethers.getContractFactory("MockCurve3Pool");
    mockCurve3Pool = await MockCurve3Pool.deploy(
      mockDai.address,
      mock3crv.address
    );

    const MockStakeDAOVault = await ethers.getContractFactory(
      "MockStakeDAOVault"
    );
    mockStakeDAOvault = await MockStakeDAOVault.deploy(mock3crv.address);

    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(
      mockStakeDAOvault.address,
      mockDai.address,
      mock3crv.address,
      mockCurve3Pool.address
    );

    const GoalOracle = await ethers.getContractFactory("GoalOracle");
    goalOracle = await GoalOracle.deploy();

    const GoalManager = await ethers.getContractFactory("GoalManager");
    goalManager = await GoalManager.deploy(mockDai.address, vault.address, goalOracle.address);

    await vault.connect(owner).transferOwnership(goalManager.address);

    await mockDai.burnFrom(
      goalSetter.address,
      await mockDai.balanceOf(goalSetter.address)
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

    it("Has a vault address", async function () {
      expect(await goalManager.vault()).to.equal(vault.address);
    });

    it("Has an oracle address", async function () {
      expect(await goalManager.oracle()).to.equal(goalOracle.address);
    });
  });

  describe("Creating goals", async function () {
    it("Creates a new goal for user", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
      let [id, pos, staker, target, stake, created, expires] =
        await goalManager.goals(1);
      expect(id).to.equal(1);
      expect(pos).to.equal(0);
      expect(staker).to.equal(goalSetter.address);
      expect(target).to.equal(100);
      expect(expires).to.equal(DEADLINE);
      expect(stake).to.equal(STAKE_AMOUNT);
      let activeGoals = await goalManager.activeGoals();
      expect(activeGoals).to.eql([parseUnits("1", "wei")]);
    });

    describe("Stake transfers", async function () {
      it("When creating a Goal, the stake is transferred from the user's account", async function () {
        let initialBalance = await mockDai.balanceOf(goalSetter.address);
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        let newBalance = await mockDai.balanceOf(goalSetter.address);

        expect(newBalance).to.equal(
          BigNumber.from(initialBalance).sub(STAKE_AMOUNT)
        );
      });

      it("When creating a Goal, the stake is deposited in the Vault", async function () {
        let initialBalance = await mockDai.balanceOf(goalSetter.address);
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        let newBalance = await vault.balanceOf(goalSetter.address);
        let expectedBalance = await mockCurve3Pool.lpTokenAmount(STAKE_AMOUNT);

        expect(newBalance).to.equal(expectedBalance);
      });

      it("Reverts if user balance is less than stake amount", async function () {
        let overStake = STAKE_AMOUNT.add(parseEther("1"));
        mockDai.connect(goalSetter).approve(goalManager.address, overStake);
        await expect(
          goalManager
            .connect(goalSetter)
            .createGoal(100, overStake, DEADLINE, IPFS_CID)
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Reverts if goal is already set", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT.div(2), DEADLINE, IPFS_CID);
        await expect(
          goalManager
            .connect(goalSetter)
            .createGoal(100, STAKE_AMOUNT.div(2), DEADLINE, IPFS_CID)
        ).to.be.revertedWith("Goal already set");
      });
    });

    describe("Goal tokens", async function () {
      it("Returns an ERC721 token to the goal setter", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        expect(await goalManager.balanceOf(goalSetter.address)).to.equal(1);
      });

      it("Sets token URI", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        expect(await goalManager.tokenURI(1)).to.equal(IPFS_CID);
      });
    });
  });

  describe("Redeeming completed goals", async function () {

    describe("Deleting goal", () => {
      let vaultBalanceBeforeWithdrawal: BigNumber;
      beforeEach(async () => {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        vaultBalanceBeforeWithdrawal = await vault.balanceOf(goalSetter.address);
        await goalOracle.connect(owner).setGoalProgress(goalSetter.address, 101);
        await goalManager.connect(goalSetter).redeemGoal(1);
      });

      it("Burns the goal token", async function () {
        expect(await goalManager.balanceOf(goalSetter.address)).to.equal(0);
      });

      it("Deletes the goal data", async function () {
        let [id, pos, staker, target, stake, created, expires] =
          await goalManager.goals(1);
        expect(id).to.equal(0);
        expect(pos).to.equal(0);
        expect(staker).to.equal("0x0000000000000000000000000000000000000000");
        expect(target).to.equal(0);
        expect(stake).to.equal(0);
        expect(created).to.equal(0);
        expect(expires).to.equal(0);
      });

      it("Deletes the staker address", async function () {
        let goalId = await goalManager.goalsByStaker(goalSetter.address);
        expect(goalId).to.equal(0);
      });

      it("Deletes the goal from the active array", async function () {
        let activeGoals = await goalManager.activeGoals();
        expect(activeGoals).to.eql([]);
      });

      it("Withdraws vault balance to msg.sender", async function () {
        let goalId = await goalManager.goalsByStaker(goalSetter.address);
        let daiWithdrawalAmount = await mockCurve3Pool.daiWithdrawalAmount(
          vaultBalanceBeforeWithdrawal
        );
        expect(await mockDai.balanceOf(goalSetter.address)).to.equal(
          daiWithdrawalAmount
        );
      });
    });

    describe("Verifying completion", () => {

      it("Reverts if target is not met", async function () {
        await goalManager
          .connect(goalSetter)
          .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        await goalOracle.connect(owner).setGoalProgress(goalSetter.address, 10);
        expect(goalManager.connect(goalSetter).redeemGoal(1)).to.be.revertedWith('Goal is incomplete');;
      });
    });
  });

  describe("Liquidating failed goals", async function () {
    it("Burns the goal token", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
      await goalManager.connect(goalSetter).liquidateGoal(1);
      expect(await goalManager.balanceOf(goalSetter.address)).to.equal(0);
    });

    it("Deletes the goal data", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
      await goalManager.connect(goalSetter).liquidateGoal(1);
      let [id, pos, staker, target, stake, created, expires] =
        await goalManager.goals(1);
      expect(id).to.equal(0);
      expect(pos).to.equal(0);
      expect(staker).to.equal("0x0000000000000000000000000000000000000000");
      expect(target).to.equal(0);
      expect(stake).to.equal(0);
      expect(created).to.equal(0);
      expect(expires).to.equal(0);
    });

    it("Reverts unless goal has expired", async function () {
      let now = Math.floor(Date.now()/1000);
      let oneYear = 31622400;
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, now + oneYear, IPFS_CID);
      expect(goalManager.connect(goalSetter).liquidateGoal(1)).to.be.revertedWith('Goal has not expired');;
    });

    it("Reverts unless goal is incomplete", async function () {
      await goalManager
        .connect(goalSetter)
        .createGoal(100, STAKE_AMOUNT, DEADLINE, IPFS_CID);
        await goalOracle.connect(owner).setGoalProgress(goalSetter.address, 101);
      expect(goalManager.connect(goalSetter).liquidateGoal(1)).to.be.revertedWith('Goal is complete');;
    });
  });
});
