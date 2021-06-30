import users from "./users";
import sessions from "./sessions";
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
    it("creates a session associated with a user", async () => {
      let user = await users.create({ address: "0x01" });
      await sessions.create({
        user: user,
        expires: 1568775134,
        nonce: "abc123",
      });
      let session = await sessions.findByUser(user.id);
      expect(session?.expires).toBe(1568775134);
      expect(session?.nonce).toBe("abc123");
    });
  });
});
