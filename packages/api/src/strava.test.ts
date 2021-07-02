import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import strava from "./strava";
import config from "../config";
import { User } from "./entity/User";
import { Token } from "./entity/Token";

jest.mock("../config");

describe("Strava", () => {
  beforeEach(() => {
    config.STRAVA_CLIENT_ID = "4567";
    config.STRAVA_CLIENT_SECRET = "strava-secret";
  });

  describe("authUrl", () => {
    it("constructs a redirect URL", () => {
      let redirectUri = new URL(strava.authURL());
      expect(redirectUri.origin).toBe("https://strava.com");
      expect(redirectUri.pathname).toBe("/oauth/authorize");
      expect(redirectUri.searchParams.get("client_id")).toBe("4567");
      expect(redirectUri.searchParams.get("redirect_uri")).toBe(
        "http://localhost:3000/link-strava/complete"
      );
      expect(redirectUri.searchParams.get("response_type")).toBe("code");
      expect(redirectUri.searchParams.get("scope")).toBe("read,activity:read");
    });
  });

  describe("getToken", () => {
    it("calls the token exchange endpoint", async () => {
      fetchMock.mockResponse(JSON.stringify({ athlete: { id: 5 } }));
      let params = new URLSearchParams();
      params.append("client_id", "4567");
      params.append("client_secret", "strava-secret");
      params.append("code", "abc123");
      params.append("grant_type", "authorization_code");
      let response = await strava.getToken("abc123");
      expect(fetchMock).toBeCalledWith(
        "https://www.strava.com/api/v3/oauth/token",
        { method: "POST", body: params }
      );
    });

    it("returns response from the token exchange endpoint", async () => {
      fetchMock.mockResponse(JSON.stringify({ athlete: { id: 5 } }));
      let response = await strava.getToken("abc123");
      expect(response).toEqual({ athlete: { id: 5 } });
    });
  });

  describe("getProfile", () => {
    it("calls the profile endpoint and returns the response", async () => {
      fetchMock.mockResponse(JSON.stringify({ id: 5 }));
      let user: User = {
        id: 1,
        address: "0x1",
      };
      let token: Token = {
        user: user,
        id: 1,
        expires: 12345,
        accessToken: "abc123",
        refreshToken: "def456",
        scopes: "read",
      };
      user.token = token;
      let response = await strava.getProfile(user);
      expect(fetchMock).toBeCalledWith(
        "https://www.strava.com/api/v3/athlete",
        {
          headers: {
            Authorization: "Bearer abc123",
          },
        }
      );
    });
  });

  describe("getProgress", () => {
    let user: User;

    beforeEach(() => {
      fetchMock.mockResponses(
        [
          JSON.stringify([
            { distance: 10000.5, manual: false },
            { distance: 20000.5, manual: false },
          ]),
          { status: 200 },
        ],
        [
          JSON.stringify([
            { distance: 50000.5, manual: false },
            { distance: 25000.5, manual: true },
          ]),
          { status: 200 },
        ],
        [JSON.stringify([]), { status: 200 }]
      );
      user = {
        id: 1,
        address: "0x1",
      };
      let token: Token = {
        user: user,
        id: 1,
        expires: 12345,
        accessToken: "abc123",
        refreshToken: "def456",
        scopes: "read",
      };
      user.token = token;
    });

    it("calls the activities endpoint", async () => {
      let response = await strava.getProgress(user, 1625192014, 1625292014);
      expect(fetchMock).toBeCalledWith(
        "https://www.strava.com/api/v3/athlete/activities?page=1&per_page=200&after=1625192014&before=1625292014",
        {
          headers: {
            Authorization: "Bearer abc123",
          },
        }
      );
    });

    it("returns the sum of all distances for non-manual activities", async () => {
      let response = await strava.getProgress(user, 1625192014, 1625292014);
      expect(response.totalDistance).toBe(80001.5);
    });
  });
});
