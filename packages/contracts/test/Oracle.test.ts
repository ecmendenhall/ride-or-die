import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther, formatBytes32String, toUtf8Bytes } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockGoalManager, MockChainlinkOracle, Oracle } from "../typechain";

describe("Vault", function () {
  let owner: SignerWithAddress,
    oracle: Oracle,
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

    const Oracle = await ethers.getContractFactory("Oracle");
    oracle = await Oracle.deploy(
      mockGoalManager.address,
      mockChainlinkOracle.address,
      toUtf8Bytes("29fa9aa13bf1468788b7cc4a500a45b8"),
      "https://api.rideordie.bike/progress/"
    );
  });

  describe("Contract setup", async function () {
    it("Has a goal manager address", async function () {
      expect(await oracle.goalManager()).to.equal(mockGoalManager.address);
    });

    it("Has a Chainlink oracle address", async function () {
      expect(await oracle.chainlinkOracle()).to.equal(
        mockChainlinkOracle.address
      );
    });

    it("Has a Chainlink jobId", async function () {
      expect(await oracle.chainlinkJobId()).to.equal(
        "0x3239666139616131336266313436383738386237636334613530306134356238"
      );
    });
  });
});
