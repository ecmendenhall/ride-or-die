import auth from './auth';
import { Buffer } from 'buffer';
import crypto from 'crypto';

jest.mock('crypto');
const mockCrypto = crypto as jest.Mocked<typeof crypto>;

type RandomBytesSync = (bytes : number) => Buffer;

describe("auth module", () => {

  describe("generateNonce", () => {

    it("generates a 16 byte hex nonce", () => {
      (mockCrypto.randomBytes as RandomBytesSync) = jest.fn(
        () =>
        Buffer.from([
          0xba,
          0xdf,
          0x00,
          0xdc,
          0xaf,
          0xed,
          0xea,
          0xdb,
          0xee,
          0xfd,
          0xec,
          0xaf,
          0xc0,
          0xff,
          0xee,
          0x00,
        ])
      );
      expect(auth.generateNonce()).toBe("badf00dcafedeadbeefdecafc0ffee00");
    });

  });

});
