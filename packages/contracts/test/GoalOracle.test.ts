import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseUnits } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { GoalOracle } from "../typechain";
import { BlockTag } from "@ethersproject/abstract-provider";


describe("GoalOracle", function () {
  let owner: SignerWithAddress,
    staker: SignerWithAddress,
    goalOracle: GoalOracle

  beforeEach(async function () {
    [owner, staker] = await ethers.getSigners();

    const GoalOracle = await ethers.getContractFactory("GoalOracle");
    goalOracle = await GoalOracle.deploy();
  });


  describe("Storing goal data", async function () {
    it("Stores progress by staker", async function () {
      await goalOracle.connect(owner).setGoalProgress(staker.address, parseUnits("4000", "wei"))
      let [val, updated] = await goalOracle.progress(staker.address);
      expect(val).to.equal(parseUnits("4000", "wei"));
    });

    it("Stores updated timestamp by staker", async function () {
      let updateTx = await goalOracle.connect(owner).setGoalProgress(staker.address, parseUnits("4000", "wei"))
      let [val, updated] = await goalOracle.progress(staker.address);
      let block = await ethers.provider.getBlock(updateTx.blockNumber as BlockTag);
      expect(updated).to.equal(block.timestamp);
    });

    it("Stores timestamp of last update", async function () {
      let updateTx = await goalOracle.connect(owner).setGoalProgress(staker.address, parseUnits("4000", "wei"))
      let block = await ethers.provider.getBlock(updateTx.blockNumber as BlockTag);
      expect(await goalOracle.lastUpdate()).to.equal(block.timestamp);
    });

    it("is only settable by onwer", async function () {
      expect(goalOracle.connect(staker).setGoalProgress(staker.address, parseUnits("4000", "wei"))).to.be.reverted;
    });
  });
});
