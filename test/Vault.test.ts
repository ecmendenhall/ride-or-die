import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

describe("Vault", function () {
  let depositor,
    mockDai,
    mock3crv,
    mockCurveDepositZap,
    mockStakeDAOvault,
    vault;

  beforeEach(async function () {
    [depositor] = await ethers.getSigners();

    const MockDai = await ethers.getContractFactory("MockERC20");
    mockDai = await MockDai.deploy("Mock Dai", "DAI");

    const Mock3Crv = await ethers.getContractFactory("MockERC20");
    mock3crv = await Mock3Crv.deploy("Mock 3Crv", "3Crv");

    const MockCurveDepositZap = await ethers.getContractFactory(
      "MockCurveDepositZap"
    );
    mockCurveDepositZap = await MockCurveDepositZap.deploy(
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
      mockCurveDepositZap.address
    );
  });

  describe("Contract setup", async function () {
    it("Has a StakeDAO vault address", async function () {
      expect(await vault.stakeDAOvault()).to.equal(mockStakeDAOvault.address);
    });

    it("Has a DAI address", async function () {
      expect(await vault.dai()).to.equal(mockDai.address);
    });
  });

  describe("Deposits", async function () {
    it("Accepts DAI deposits, returns vault shares", async function () {
      let deposit = parseEther("2500");
      await mockDai.mint(depositor.address, deposit);
      await mockDai.connect(depositor).approve(vault.address, deposit);
      await vault.connect(depositor).deposit(deposit);
      expect(await vault.balanceOf(depositor.address)).to.equal(
        parseEther("2469.135802469135802469")
      );
    });
  });
});
