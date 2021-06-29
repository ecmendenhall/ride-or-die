import request, { Response } from "supertest";
import app from "./app";

describe("API", () => {
  describe("/authenticate", () => {
    describe("GET", () => {
      let response: Response;
      let redirectUri: URL;

      beforeEach(async () => {
        response = await request(app).get("/authenticate");
        redirectUri = new URL(response.headers.location);
      });

      it("returns a 302 found", () => {
        expect(response.statusCode).toBe(302);
      });

      it("redirects to Strava", () => {
        expect(redirectUri.origin).toBe("https://strava.com");
        expect(redirectUri.pathname).toBe("/oauth/authorize");
      });

      it("passes client ID", () => {
        expect(redirectUri.searchParams.get("client_id")).toBe("12345");
      });

      it("passes redirect URI", () => {
        expect(redirectUri.searchParams.get("redirect_uri")).toBe(
          "http://localhost:3000/authenticate/complete"
        );
      });

      it("passes response type", () => {
        expect(redirectUri.searchParams.get("response_type")).toBe("code");
      });

      it("passes scope", () => {
        expect(redirectUri.searchParams.get("scope")).toBe(
          "read,activity:read"
        );
      });

      it("passes approval prompt", () => {
        expect(redirectUri.searchParams.get("approval_prompt")).toBe("force");
      });
    });

    describe("/complete", () => {
      describe("success", () => {
        it("returns a 200 OK", async () => {
          let response = await request(app)
            .get("/authenticate/complete")
            .query({ code: "abc123", scope: "read,activity:read" });
          expect(response.statusCode).toBe(200);
        });
      });

      describe("error", () => {
        it("returns a 403 Forbidden", async () => {
          let response = await request(app)
            .get("/authenticate/complete")
            .query({ error: "access_denied" });
          expect(response.statusCode).toBe(403);
        });
      });
    });
  });

  describe("/goals", () => {
    it("returns a 200 OK", async () => {
      let response = await request(app).get("/goals");
      expect(response.statusCode).toBe(200);
    });
  });
});
