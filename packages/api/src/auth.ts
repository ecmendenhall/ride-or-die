import crypto from "crypto";

const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

export default {
  generateNonce: generateNonce,
};
