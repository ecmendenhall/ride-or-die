import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther, formatBytes32String, toUtf8Bytes, getAddress } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockGoalManager, MockChainlinkOracle, ChainlinkGoalOracle } from "../typechain";

describe("Vault", function () {
  let owner: SignerWithAddress,
    chainlinkGoalOracle: ChainlinkGoalOracle,
    mockGoalManager: MockGoalManager,
    mockChainlinkOracle: MockChainlinkOracle;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const MockChainlinkOracle = await ethers.getContractFactory(
      "MockChainlinkOracle"
    );
    mockChainlinkOracle = await MockChainlinkOracle.deploy();

    const MockGoalManager = await ethers.getContractFactory("MockGoalManager");
    mockGoalManager = await MockGoalManager.deploy();

    const ChainlinkGoalOracle = await ethers.getContractFactory("ChainlinkGoalOracle");
    chainlinkGoalOracle = await ChainlinkGoalOracle.deploy(
      mockGoalManager.address,
      mockChainlinkOracle.address,
      toUtf8Bytes("29fa9aa13bf1468788b7cc4a500a45b8"),
      "https://api.rideordie.bike/progress/"
    );
  });

  describe("Contract setup", async function () {
    it("Has a goal manager address", async function () {
      expect(await chainlinkGoalOracle.goalManager()).to.equal(mockGoalManager.address);
    });

    it("Has a Chainlink Oracle address", async function () {
      expect(await chainlinkGoalOracle.chainlinkOracle()).to.equal(
        mockChainlinkOracle.address
      );
    });

    it("Has a Chainlink jobId", async function () {
      expect(await chainlinkGoalOracle.chainlinkJobId()).to.equal(
        "0x3239666139616131336266313436383738386237636334613530306134356238"
      );
    });

    it("Has an API baseURL", async function () {
      expect(await chainlinkGoalOracle.apiBaseUrl()).to.equal("https://api.rideordie.bike/progress/");
    });
  });

  describe("Contract setup", async function () {
    it("Constructs a verification URL", async function () {
      let [staker, target, stake, created, expires] = await mockGoalManager.goals(1);
      expect(await chainlinkGoalOracle.verificationURL(1)).to.equal(
        `https://api.rideordie.bike/progress/${staker.toLowerCase()}/?after=${created}&before=${expires}`
      );
    });

    it("Constructs a Chainlink request", async function () {
      let [ id, callbackAddress, callbackFunctionId, nonce, buffer ] = await chainlinkGoalOracle.newChainlinkRequest(1);
      expect(id).to.equal("0x3239666139616131336266313436383738386237636334613530306134356238");
      expect(callbackAddress).to.equal(chainlinkGoalOracle.address);
      expect(callbackFunctionId).to.equal('0x4357855e');
      expect(nonce).to.equal(0);
    });

  });
});
