import auth from "./auth";
import { Buffer } from "buffer";
import crypto from "crypto";
import { ethers } from "ethers";
import users from "./users";
import sessions from "./sessions";
import testHelpers from "../lib/test-helpers";

const mockCrypto = crypto as jest.Mocked<typeof crypto>;

type RandomBytesSync = (bytes: number) => Buffer;

describe("auth module", () => {
  beforeAll(async () => {
    await testHelpers.db.setUp();
  });

  afterAll(async () => {
    await testHelpers.db.tearDown();
  });

  afterEach(async () => {
    await testHelpers.db.clear();
  });

  describe("generateNonce", () => {
    it("generates a 16 byte hex nonce", () => {
      (mockCrypto.randomBytes as RandomBytesSync) = jest.fn(() =>
        Buffer.from([
          0xba, 0xdf, 0x00, 0xdc, 0xaf, 0xed, 0xea, 0xdb, 0xee, 0xfd, 0xec,
          0xaf, 0xc0, 0xff, 0xee, 0x00,
        ])
      );
      expect(auth.generateNonce()).toBe("badf00dcafedeadbeefdecafc0ffee00");
    });
  });

  describe("logIn", () => {
    it("creates a user if one does not exist", async () => {
      let created = await auth.logIn("0x1");
      let user = await users.find("0x1");
      expect(created).toStrictEqual(user);
    });

    it("creates a session associated with the user", async () => {
      let user = await auth.logIn("0x1");
      expect(user?.session?.nonce).toBe("badf00dcafedeadbeefdecafc0ffee00");
    });

    it("updates the session associated with the user if one already exists", async () => {
      let user = await auth.logIn("0x1");
      let initialNonce = user?.session?.nonce;
      (mockCrypto.randomBytes as RandomBytesSync) = jest.fn(() =>
        Buffer.from([
          0xba, 0xdf, 0x00, 0xdc, 0xaf, 0xed, 0xea, 0xdb, 0xee, 0xfd, 0xec,
          0xaf, 0xc0, 0xff, 0xee, 0x01,
        ])
      );
      user = await auth.logIn("0x1");
      let newNonce = user?.session?.nonce;
      expect(initialNonce).not.toBe(newNonce);
    });
  });

  describe("verifySignature", () => {
    it("verifies a signed nonce", async () => {
      let signer = ethers.Wallet.createRandom();
      let user = await auth.logIn(signer.address);
      let nonce = user?.session?.nonce || "";
      let signature = await signer.signMessage(nonce);
      let verified = await auth.verifySignature(signer.address, signature);
      expect(verified).toBe(true);
    });

    it("rejects invalid signatures", async () => {
      let signer = ethers.Wallet.createRandom();
      let rando = ethers.Wallet.fromMnemonic(
        "radar blur cabbage chef fix engine embark joy scheme fiction master release"
      );
      expect(signer.address).not.toBe(rando.address);
      let user = await auth.logIn(signer.address);
      let nonce = user?.session?.nonce || "";
      let signature = await rando.signMessage(nonce);
      let verified = await auth.verifySignature(signer.address, signature);
      expect(verified).toBe(false);
    });
  });

  describe("generateJWT", () => {
    it("generates a JWT for a given address", () => {
      let signer = ethers.Wallet.fromMnemonic(
        "radar blur cabbage chef fix engine embark joy scheme fiction master release"
      );
      let token = auth.generateJWT(signer.address);
      let decoded = auth.verifyJWT(token);
      expect(decoded.address).toBe(signer.address);
    });
  });
});
