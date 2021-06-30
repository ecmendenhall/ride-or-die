import "reflect-metadata";
import express from "express";

import config from "../config";
import strava from "./strava";

const app = express();

app.get("/link-strava", (req, res) => {
  res.redirect(302, strava.authURL());
});

app.get("/link-strava/complete", async (req, res) => {
  if (req.query.error) {
    res.status(403).send("Forbidden");
  } else {
    let code = req.query.code as string;
    let responseData = await strava.getToken(code);
    res.status(200).send(responseData.athlete);
  }
});

app.get("/goals", (req, res) => {
  res.status(200).send("OK");
});

export default app;
