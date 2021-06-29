import request from 'supertest';
import app from './app';

describe("API", () => {

  describe("/goals", () => {
    it("returns a 200 OK", async () => {
      let response = await request(app).get("/goals");
      expect(response.statusCode).toBe(200);
    });
  });

});
