import { expect } from "chai";
import { waffle, ethers } from "hardhat";

describe("Token", function() {

  it("Has a name", async function() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();

    expect(await token.name()).to.equal("My rad token");
  });

});
