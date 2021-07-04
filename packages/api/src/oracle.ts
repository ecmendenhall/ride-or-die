import { ethers, BigNumber } from "ethers";
const { parseEther, zeroPad, arrayify, concat } = ethers.utils;

const encodeResponse = (goalId : number, distance : string) => {
  let goalBuf = zeroPad(arrayify(goalId), 4)
  let distanceBuf = Buffer.from(
    zeroPad(
      arrayify(parseEther(distance)),
      16
    )
  );
  return ethers.utils.hexlify(
    zeroPad(
      concat([goalBuf, distanceBuf]),
      32)
  );
}

export default {
  encodeResponse: encodeResponse
};
