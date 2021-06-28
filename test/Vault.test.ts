import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

describe("Vault", function () {
  let owner,
    staker,
    thirdParty,
    mockDai,
    mock3crv,
    mockCurve3Pool,
    mockStakeDAOvault,
    vault;

  beforeEach(async function () {
    [owner, staker, thirdParty] = await ethers.getSigners();

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
  });

  describe("Contract setup", async function () {
    it("Has a StakeDAO vault address", async function () {
      expect(await vault.stakeDAOvault()).to.equal(mockStakeDAOvault.address);
    });

    it("Has the DAI token address", async function () {
      expect(await vault.dai()).to.equal(mockDai.address);
    });

    it("Has the 3Crv token address", async function () {
      expect(await vault.threeCrv()).to.equal(mock3crv.address);
    });
  });

  describe("Deposits", async function () {
    beforeEach(async function () {
      let deposit = parseEther("2500");
      await mockDai.mint(owner.address, deposit);
      await mockDai.connect(owner).approve(vault.address, deposit);
      await vault.connect(owner).deposit(staker.address, deposit);
    });

    it("Accepts DAI deposits, returns vault shares", async function () {
      expect(await vault.balanceOf(staker.address)).to.equal(
        parseEther("2469.135802469135802469")
      );
    });

    it("Only owner can deposit", async function () {
      let deposit = parseEther("2500");
      await mockDai.mint(staker.address, deposit);
      await mockDai.connect(staker).approve(vault.address, deposit);
      expect(
        vault.connect(staker).deposit(staker.address, deposit)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Vault shares are nontransferrable with transfer", async function () {
      expect(
        vault.connect(staker).transfer(thirdParty.address, parseEther("2469"))
      ).to.be.revertedWith("Token is nontransferrable");
    });

    it("transferFrom cannot send shares to third parties", async function () {
      await vault
        .connect(staker)
        .increaseAllowance(thirdParty.address, parseEther("2469"));
      expect(
        vault
          .connect(thirdParty)
          .transferFrom(staker.address, thirdParty.address, parseEther("2469"))
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Withdrawals", async function () {
    beforeEach(async function () {
      let deposit = parseEther("2500");
      await mockDai.mint(owner.address, deposit);
      await mockDai.connect(owner).approve(vault.address, deposit);
      await vault.connect(owner).deposit(staker.address, deposit);
    });

    it("Only owner can withdraw", async function () {
      expect(
        vault.connect(staker).withdraw(staker.address, parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Withdrawal burns vault shares", async function () {
      await vault.connect(owner).withdraw(staker.address, parseEther("1000"));
      expect(await vault.balanceOf(staker.address)).to.equal(
        parseEther("1469.135802469135802469")
      );
    });

    it("Withdrawal returns Dai value of vault shares, minus Curve withdrawal slippage", async function () {
      let fullBalance = await vault.balanceOf(staker.address);
      await vault.connect(owner).withdraw(staker.address, fullBalance);
      expect(await vault.balanceOf(staker.address)).to.equal(0);
      expect(await mockDai.balanceOf(staker.address)).to.equal(
        parseEther("2497.50")
      );
    });
  });
});
