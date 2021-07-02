import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";

import config from "../config";
import strava from "./strava";
import users from "./users";
import tokens from "./tokens";
import auth, { JWTPayload } from "./auth";

const app = express();
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
  res.redirect(302, strava.authURL());
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
      scopes: 'read,activity:read'
    });
    res.status(200).send({ address: user.address, profile: responseData.athlete });
  }
});

app.get("/goals", (req, res) => {
  res.status(200).send("OK");
});

export default app;
