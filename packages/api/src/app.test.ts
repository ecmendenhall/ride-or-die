import request, { Response } from "supertest";
import app from "./app";
import strava from "./strava";
import users from "./users";
import auth from "./auth";
import tokens from "./tokens";
import { User } from "./entity/User";

jest.mock("./strava");
const mockStrava = strava as jest.Mocked<typeof strava>;

jest.mock("./users");
const mockUsers = users as jest.Mocked<typeof users>;

jest.mock("./auth");
const mockAuth = auth as jest.Mocked<typeof auth>;

jest.mock("./tokens");
const mockTokens = tokens as jest.Mocked<typeof tokens>;

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
    beforeEach(async () => {
      mockAuth.requireLogin.mockImplementation((req, res, next) => {
        req.user = { id: 1, address: "0x1" };
        next();
      });
    });

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
          expires_at: 1625129490,
          access_token: "abc123",
          refresh_token: "def456",
          athlete: { id: 5 },
        });
        mockUsers.create.mockResolvedValue({
          id: 1,
          address: "0x1",
          stravaId: 5,
        });
      });

      describe("success", () => {
        it("returns a 302 to the profile route", async () => {
          let response = await request(app)
            .get("/link-strava/complete")
            .query({ code: "abc123", scope: "read,activity:read" });
          expect(response.statusCode).toBe(302);
          expect(response.headers.location).toBe("/profile");
        });

        it("updates User with associated Strava ID and token", async () => {
          let response = await request(app)
            .get("/link-strava/complete")
            .query({ code: "abc123", scope: "read,activity:read" });
          expect(mockUsers.update).toHaveBeenCalledWith("0x1", {
            address: "0x1",
            stravaId: 5,
          });
          expect(mockTokens.create).toHaveBeenCalledWith("0x1", {
            expires: 1625129490,
            accessToken: "abc123",
            refreshToken: "def456",
            scopes: "read,activity:read",
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

  describe("/profile", () => {
    beforeEach(async () => {
      mockAuth.requireLogin.mockImplementation((req, res, next) => {
        req.user = { id: 1, address: "0x1" };
        next();
      });
      mockUsers.find.mockResolvedValue({ id: 1, address: "0x1" });
      mockStrava.getProfile.mockResolvedValue({
        id: 5,
      });
    });

    it("returns a 200 OK", async () => {
      let response = await request(app).get("/profile");
      expect(response.statusCode).toBe(200);
    });

    it("returns profile data", async () => {
      let response = await request(app).get("/profile");
      expect(response.body).toStrictEqual({
        address: "0x1",
        profile: { id: 5 },
      });
    });
  });

  describe("/progress", () => {
    beforeEach(async () => {
      mockUsers.find.mockResolvedValue({ id: 1, address: "0x1" });
      mockStrava.getProgress.mockResolvedValue({
        totalDistance: 500,
      });
    });

    it("returns a 200 OK", async () => {
      let response = await request(app).get("/progress/0x1");
      expect(response.statusCode).toBe(200);
    });

    it("returns progress data", async () => {
      let response = await request(app).get("/progress/0x1");
      expect(response.body).toStrictEqual({
        totalDistance: 500
      });
    });
  });
});
