import * as dotenv from "dotenv";

dotenv.config();

interface Config {
  STRAVA_CLIENT_ID: string;
  STRAVA_CLIENT_SECRET: string;
  SECRET_KEY: string;
}

const config: Config = {
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID || "12345",
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || "strava-secret",
  SECRET_KEY: process.env.SECRET_KEY || "secret-key",
};

export default config;
