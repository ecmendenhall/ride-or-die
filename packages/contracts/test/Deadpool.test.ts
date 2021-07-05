import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Deadpool,
  MockStakeDAOVault,
  MockERC20,
} from "../typechain";
import { BigNumber } from "ethers";


describe("Deadpool", function () {
  let owner: SignerWithAddress,
    staker: SignerWithAddress,
    staker2: SignerWithAddress,
    staker3: SignerWithAddress,
    mockSd3Crv: MockERC20,
    deadpool: Deadpool;

  beforeEach(async function () {
    [owner, staker, staker2, staker3] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory(
      "MockERC20"
    );
    mockSd3Crv = await MockERC20.deploy("Mock sd3Crv", "sd3Crv");

    const Deadpool = await ethers.getContractFactory("Deadpool");
    deadpool = await Deadpool.deploy(
      mockSd3Crv.address
    );
  });


  describe("Token", async function () {
    it("Has a name", async function () {
      expect(await deadpool.name()).to.equal("Ride or Die Deadpool");
    });

    it("Has a symbol", async function () {
      expect(await deadpool.symbol()).to.equal("DIE-sd3Crv");
    });

    it("Has the sd3Crv vault address", async function () {
      expect(await deadpool.sd3Crv()).to.equal(mockSd3Crv.address);
    });
  });

  describe("Issuing shares", async function () {
    it("Owner can issue shares", async function () {
      await deadpool.connect(owner).issueShares(staker.address, parseEther("100"));
      expect(await deadpool.balanceOf(staker.address)).to.equal(parseEther("100"));
    });

    it("Non-owner cannot issue shares", async function () {
      expect(deadpool.connect(staker).issueShares(staker.address, parseEther("100"))).to.be.reverted;
    });
  });

  describe("Share value", async function () {
    it("Share value is sd3Crv balance * shares / totalSupply", async function () {
      await mockSd3Crv.mint(deadpool.address, parseEther("10000"));

      await deadpool.connect(owner).issueShares(staker.address, parseEther("50"));
      await deadpool.connect(owner).issueShares(staker2.address, parseEther("200"));
      await deadpool.connect(owner).issueShares(staker3.address, parseEther("750"));

      expect(await deadpool.pricePerShare()).to.equal(parseEther("10"));
      expect(await deadpool.shareValue(parseEther("400"))).to.equal(parseEther("4000"));
    });
  });

  describe("Redeeming shares", async function () {

    beforeEach(async () => {
      await mockSd3Crv.mint(deadpool.address, parseEther("10000"));
      await deadpool.connect(owner).issueShares(staker.address, parseEther("50"));
      await deadpool.connect(owner).issueShares(staker2.address, parseEther("200"));
      await deadpool.connect(owner).issueShares(staker3.address, parseEther("750"));

      await deadpool.connect(staker2).redeemShares(parseEther("200"));
      await deadpool.connect(staker3).redeemShares(parseEther("50"));
    });

    it("Redeeming shares burns DIE-sd3Crv", async function () {
      expect(await deadpool.totalSupply()).to.equal(parseEther("750"));
      expect(await deadpool.balanceOf(staker3.address)).to.equal(parseEther("700"));
      expect(await deadpool.balanceOf(staker2.address)).to.equal(0);
    });

    it("Redeeming shares returns sd3Crv to caller", async function () {
      expect(await mockSd3Crv.balanceOf(deadpool.address)).to.equal(parseEther("7000"));
      expect(await mockSd3Crv.balanceOf(staker2.address)).to.equal(parseEther("2500"));
      expect(await mockSd3Crv.balanceOf(staker3.address)).to.equal(parseEther("500"));
    });
  });
});
