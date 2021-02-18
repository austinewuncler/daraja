import builder from "../src";
import MpesaAPIBuilder from "../src/mpesa.api.builder";

describe("daraja", () => {
  it("should return a builder object", () => {
    expect(builder(123456, "key", "secret")).toBeInstanceOf(MpesaAPIBuilder);
  });
});
