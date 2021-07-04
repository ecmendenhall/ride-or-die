import fetch from "node-fetch";
import config from "../config";
import { User } from "./entity/User";

interface Athlete {
  id: number;
}

interface StravaAuthResponse {
  expires_at: number;
  access_token: string;
  refresh_token: string;
  athlete: Athlete;
}

interface StravaActivity {
  distance: number;
  manual: boolean;
}

const authURL = () => {
  let url = new URL("https://strava.com/oauth/authorize");
  url.searchParams.append("client_id", config.STRAVA_CLIENT_ID);
  url.searchParams.append(
    "redirect_uri",
    `http://localhost:3001/link-strava/complete`
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

const getProfile = async (user: User) => {
  let athleteResponse = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: {
      Authorization: `Bearer ${user?.token?.accessToken}`,
    },
  });
  let athleteResponseData = await athleteResponse.json();
  let { id } = athleteResponseData;
  let statsResponse = await fetch(`https://www.strava.com/api/v3/athletes/${id}/stats`, {
    headers: {
      Authorization: `Bearer ${user?.token?.accessToken}`,
    },
  });
  let statsResponseData = await statsResponse.json();
  return { athlete: athleteResponseData, stats: statsResponseData };
};

const getProgress = async (user: User, after: number, before: number) => {
  let allActivities: StravaActivity[] = [];
  let page = 1;
  while (true) {
    let response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200&after=${after}&before=${before}`,
      {
        headers: {
          Authorization: `Bearer ${user?.token?.accessToken}`,
        },
      }
    );
    let responseData: StravaActivity[] = await response.json();
    if (responseData.length === 0) {
      break;
    }
    allActivities = allActivities.concat(responseData);
    page++;
  }
  let activities = allActivities.filter(
    (activity: StravaActivity) => activity.manual === false
  );
  let total = activities.reduce(
    (acc: number, activity: StravaActivity) => acc + activity.distance,
    0
  );
  return { totalDistance: total };
};

export default {
  authURL: authURL,
  getToken: getToken,
  getProfile: getProfile,
  getProgress: getProgress,
};
