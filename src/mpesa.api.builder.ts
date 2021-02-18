import MpesaAPI, { Env, IMpesaAPIConfig } from "./mpesa.api";

export default class MpesaAPIBuilder {
  private config: IMpesaAPIConfig;

  constructor(
    private shortcode: number,
    private consumerKey: string,
    private consumerSecret: string
  ) {
    this.config = { env: "sandbox" };
  }

  env = (env: Env): MpesaAPIBuilder => {
    this.config = { env, ...this.config };
    return this;
  };

  lnmPasskey = (passkey: string): MpesaAPIBuilder => {
    this.config = { lnmPasskey: passkey, ...this.config };
    return this;
  };

  build = (): MpesaAPI => {
    return new MpesaAPI(
      this.shortcode,
      this.consumerKey,
      this.consumerSecret,
      this.config
    );
  };
}
