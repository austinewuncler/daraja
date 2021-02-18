import MpesaAPI from "../src/mpesa.api";
import MpesaAPIBuilder from "../src/mpesa.api.builder";

describe("mpesa API builder", () => {
  let builder: MpesaAPIBuilder;

  beforeAll(() => {
    builder = new MpesaAPIBuilder(123456, "key", "secret");
  });

  describe("env", () => {
    it("should return a builder object", () => {
      expect(builder.env("sandbox")).toBeInstanceOf(MpesaAPIBuilder);
    });
  });

  describe("lnmPasskey", () => {
    it("should return a builder object", () => {
      expect(builder.lnmPasskey("passkey")).toBeInstanceOf(MpesaAPIBuilder);
    });
  });

  describe("build", () => {
    it("should return a daraja object", () => {
      expect(builder.build()).toBeInstanceOf(MpesaAPI);
    });
  });
});
