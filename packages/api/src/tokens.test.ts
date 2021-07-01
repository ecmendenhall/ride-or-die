import users from "./users";
import tokens from "./tokens";
import testHelpers from "../lib/test-helpers";

describe("tokens module", () => {
  beforeAll(async () => {
    await testHelpers.db.setUp();
  });

  afterAll(async () => {
    await testHelpers.db.tearDown();
  });

  afterEach(async () => {
    await testHelpers.db.clear();
  });

  describe("create", () => {
    it("creates a token associated with a user", async () => {
      let user = await users.create({ address: "0x01" });
      await tokens.create(user.address, {
        expires: 1568775134,
        accessToken: "abc123",
        refreshToken: "def456",
        scopes: "read,activity:read",
      });
      let token = await tokens.findByUser(user.address);
      expect(token?.expires).toBe(1568775134);
      expect(token?.accessToken).toBe("abc123");
      expect(token?.refreshToken).toBe("def456");
      expect(token?.scopes).toBe("read,activity:read");
    });
  });
});
