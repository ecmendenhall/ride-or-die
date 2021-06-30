import "reflect-metadata";
import express from "express";

import config from "../config";
import strava from "./strava";
import users from "./users";
import auth from "./auth";

const app = express();
app.use(express.json());

app.post("/login", async (req, res) => {
  let user = await auth.logIn(req.body.address);
  res.status(200).send({ nonce: user?.session?.nonce });
});

app.post("/login/sign", async (req, res) => {
  let { address, signature } = req.body;
  let authenticated = await auth.verifySignature(address, signature);
  if (authenticated) {
    res.status(200).send();
  } else {
    res.status(401).send();
  }
});

app.get("/link-strava", (req, res) => {
  res.redirect(302, strava.authURL());
});

app.get("/link-strava/complete", async (req, res) => {
  if (req.query.error) {
    res.status(403).send("Forbidden");
  } else {
    let code = req.query.code as string;
    let responseData = await strava.getToken(code);
    await users.create({
      address: "0x1",
      stravaId: responseData.athlete.id,
    });
    res.status(200).send(responseData.athlete);
  }
});

app.get("/goals", (req, res) => {
  res.status(200).send("OK");
});

export default app;
