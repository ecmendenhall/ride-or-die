import fetch from "node-fetch";
import config from "../config";

interface Athlete {
  id: number;
}

interface StravaAuthResponse {
  athlete: Athlete;
}

const authURL = () => {
  let url = new URL("https://strava.com/oauth/authorize");
  url.searchParams.append("client_id", config.STRAVA_CLIENT_ID);
  url.searchParams.append(
    "redirect_uri",
    "http://localhost:3000/link-strava/complete"
  );
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", "read,activity:read");
  url.searchParams.append("approval_prompt", "force");
  return url.href;
};

const getToken = async (code: string) => {
  let params = new URLSearchParams();
  params.append("client_id", config.STRAVA_CLIENT_ID);
  params.append("client_secret", config.STRAVA_CLIENT_SECRET);
  params.append("code", code);
  params.append("grant_type", "authorization_code");

  let authResponse = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    body: params,
  });
  let responseData: StravaAuthResponse = await authResponse.json();
  return responseData;
};

export default {
  authURL: authURL,
  getToken: getToken,
};
