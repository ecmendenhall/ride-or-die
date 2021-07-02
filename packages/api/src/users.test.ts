import users from "./users";
import testHelpers from "../lib/test-helpers";

describe("users module", () => {
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
    it("creates a user", async () => {
      await users.create({ address: "0x01" });
      let user = await users.find("0x01");
      expect(user?.id).toBe(1);
      expect(user?.address).toBe("0x01");
    });

    it("enforces unique address", async () => {
      await users.create({ address: "0x01" });
      await expect(users.create({ address: "0x01" })).rejects.toThrow(
        "duplicate key value violates unique constraint"
      );
    });
  });
});
