import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import crypto from "crypto";
import { ethers } from "ethers";
import users from "./users";
import sessions from "./sessions";
import config from "../config";

export interface JWTPayload {
  address: string;
  exp: number;
  iap: number;
}

const requireLogin = expressJwt({
  secret: config.SECRET_KEY,
  algorithms: ["HS256"],
  getToken: (req) => req.headers.authorization?.split(' ')[1] || req.params.token || req.cookies.token
});

const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

const logIn = async (address: string) => {
  let user = await users.find(address);
  if (!user) {
    user = await users.create({
      address: address,
    });
  }
  user = await sessions.create({
    user: user,
    nonce: generateNonce(),
  });
  return user;
};

const verifySignature = async (address: string, signature: string) => {
  let user = await users.find(address);
  let nonce = user?.session?.nonce || "";
  let signer = ethers.utils.verifyMessage(nonce, signature);
  return signer === address;
};

const generateJWT = (address: string) => {
  let payload = {
    address: address,
  };
  return jwt.sign(payload, config.SECRET_KEY, { expiresIn: "7d" });
};

const verifyJWT = (token: string) => {
  return jwt.verify(token, config.SECRET_KEY) as JWTPayload;
};

export default {
  generateNonce: generateNonce,
  verifySignature: verifySignature,
  generateJWT: generateJWT,
  verifyJWT: verifyJWT,
  logIn: logIn,
  requireLogin: requireLogin,
};
