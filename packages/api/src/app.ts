import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import config from "../config";
import strava from "./strava";
import users from "./users";
import tokens from "./tokens";
import auth, { JWTPayload } from "./auth";
import { addSyntheticLeadingComment } from "typescript";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.post("/login", async (req, res) => {
  let user = await auth.logIn(req.body.address);
  res.status(200).send({ nonce: user?.session?.nonce });
});

app.post("/login/sign", async (req, res) => {
  let { address, signature } = req.body;
  let authenticated = await auth.verifySignature(address, signature);
  if (authenticated) {
    let token = auth.generateJWT(address);
    res.cookie("token", token, { httpOnly: true });
    res.status(200).send({ token: token });
  } else {
    res.status(401).send();
  }
});

app.get("/link-strava", auth.requireLogin, (req, res) => {
  res.status(200).send({ location: strava.authURL() });
});

app.get("/link-strava/complete", auth.requireLogin, async (req, res) => {
  if (req.query.error) {
    res.status(403).send("Forbidden");
  } else {
    let code = req.query.code as string;
    let responseData = await strava.getToken(code);
    let user = req.user as JWTPayload;
    await users.update(user.address, {
      address: user.address,
      stravaId: responseData.athlete.id,
    });
    await tokens.create(user.address, {
      expires: responseData.expires_at,
      accessToken: responseData.access_token,
      refreshToken: responseData.refresh_token,
      scopes: "read,activity:read",
    });
    res.redirect(302, "http://localhost:3000/");
  }
});

app.get("/profile", auth.requireLogin, async (req, res) => {
  let { address } = req.user as JWTPayload;
  let user = await users.find(address);
  if (user) {
    let { athlete, stats } = await strava.getProfile(user);
    res
      .status(200)
      .send({ address: user.address, athlete: athlete, stats: stats });
  } else {
    res.status(404);
  }
});

app.get("/progress/:address/", async (req, res) => {
  let user = await users.find(req.params.address);
  if (user) {
    let { after, before } = req.query;
    let progressData = await strava.getProgress(
      user,
      after as string,
      before as string
    );
    res.status(200).send(progressData);
  } else {
    res.status(404);
  }
});

export default app;
