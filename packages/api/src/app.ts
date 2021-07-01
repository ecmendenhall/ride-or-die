import "reflect-metadata";
import express from "express";
import jwt from "express-jwt";
import cookieParser from "cookie-parser";

import config from "../config";
import strava from "./strava";
import users from "./users";
import auth, { JWTPayload } from "./auth";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

const jwtAuth = jwt({
  secret: config.SECRET_KEY,
  algorithms: ["HS256"],
  getToken: (req) => req.cookies.token,
});

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

app.get("/link-strava", jwtAuth, (req, res) => {
  res.redirect(302, strava.authURL());
});

app.get("/link-strava/complete", jwtAuth, async (req, res) => {
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
    res.status(200).send(responseData.athlete);
  }
});

app.get("/goals", (req, res) => {
  res.status(200).send("OK");
});

export default app;
