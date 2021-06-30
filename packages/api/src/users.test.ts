import users from './users';
import db from './database';

describe("users module", () => {

  beforeAll(async () => {
    await db.connection.create();
  });

  afterAll(async () => {
    await db.testHelpers.clear();
    await db.connection.close();
  });

  afterEach(async () => {
    await db.testHelpers.clear();
  });

  describe("create", () => {

    it("creates a user", async () => {
      await users.create({address: "0x01"});
      let user = await users.find("0x01");
      expect(user?.id).toBe(1);
      expect(user?.address).toBe("0x01");
    });

  });
});
