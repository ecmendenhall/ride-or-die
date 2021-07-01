import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import strava from "./strava";
import config from "../config";

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
});
