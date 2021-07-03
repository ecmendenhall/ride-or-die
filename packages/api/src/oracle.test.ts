import oracle from "./oracle";

describe("oracle module", () => {

  it("encodes goal id and value for response", () => {
    expect(oracle.encodeResponse(1, "400.12345")).toBe("0x000000000000000000000000000000010000000000000015b0d40dd481c5a000");
  });

});
