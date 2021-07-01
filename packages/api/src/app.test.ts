import request, { Response } from "supertest";
import app from "./app";
import strava from "./strava";
import users from "./users";
import auth from "./auth";
import { User } from "./entity/User";

jest.mock("./strava");
const mockStrava = strava as jest.Mocked<typeof strava>;

jest.mock("./users");
const mockUsers = users as jest.Mocked<typeof users>;

jest.mock("./auth");
const mockAuth = auth as jest.Mocked<typeof auth>;

describe("API", () => {
  describe("/login", () => {
    describe("POST", () => {
      beforeEach(() => {
        let user = { id: 1 } as User;
        user.session = {
          id: 1,
          nonce: "abc123",
          user: user,
        };
        mockAuth.logIn.mockResolvedValue(user);
      });

      it("returns a nonce to sign", async () => {
        let response = await request(app)
          .post("/login")
          .send({ address: "0x1" })
          .set("Content-Type", "application/json");
        expect(response.body).toStrictEqual({ nonce: "abc123" });
      });
    });

    describe("/login/sign", () => {
      describe("POST", () => {
        it("returns 200 on valid signature", async () => {
          mockAuth.verifySignature.mockResolvedValue(true);
          let response = await request(app)
            .post("/login/sign")
            .send({ address: "0x1", signature: "abc123" })
            .set("Content-Type", "application/json");
          expect(response.statusCode).toBe(200);
        });

        it("returns token on valid signature", async () => {
          mockAuth.verifySignature.mockResolvedValue(true);
          mockAuth.generateJWT.mockReturnValue("def456");
          let response = await request(app)
            .post("/login/sign")
            .send({ address: "0x1", signature: "abc123" })
            .set("Content-Type", "application/json");
          expect(response.body).toStrictEqual({ token: "def456" });
        });

        it("returns 401 on invalid signature", async () => {
          mockAuth.verifySignature.mockResolvedValue(false);
          let response = await request(app)
            .post("/login/sign")
            .send({ address: "0x1", signature: "abc123" })
            .set("Content-Type", "application/json");
          expect(response.statusCode).toBe(401);
        });
      });
    });
  });

  describe("/link-strava", () => {
    describe("GET", () => {
      let response: Response;
      let redirectUri: URL;

      beforeEach(async () => {
        mockStrava.authURL.mockReturnValue(
          "https://strava.com/oauth/authorize?client_id=12345&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauthenticate%2Fcomplete&response_type=code&scope=read%2Cactivity%3Aread&approval_prompt=force"
        );
        response = await request(app).get("/link-strava");
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
      beforeEach(() => {
        mockStrava.getToken.mockResolvedValue({
          athlete: { id: 5 },
        });
        mockUsers.create.mockResolvedValue({
          id: 1,
          address: "0x1",
          stravaId: 5,
        });
      });

      describe("success", () => {
        it("returns a 200 OK", async () => {
          let response = await request(app)
            .get("/link-strava/complete")
            .query({ code: "abc123", scope: "read,activity:read" });
          expect(response.statusCode).toBe(200);
        });

        it("returns athlete data", async () => {
          let response = await request(app)
            .get("/link-strava/complete")
            .query({ code: "abc123", scope: "read,activity:read" });
          expect(response.body).toEqual({ id: 5 });
        });

        it("creates a User with associated Strava ID and token", async () => {
          let response = await request(app)
            .get("/link-strava/complete")
            .query({ code: "abc123", scope: "read,activity:read" });
          expect(mockUsers.create).toHaveBeenCalledWith({
            address: "0x1",
            stravaId: 5,
          });
        });
      });

      describe("error", () => {
        it("returns a 403 Forbidden", async () => {
          let response = await request(app)
            .get("/link-strava/complete")
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