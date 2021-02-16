import axios from "axios";

export default class Daraja {
  static BASE_URL = "https://{}.safaricom.co.ke";
  static GENERATE_ACCESS_TOKEN = "/oauth/v1/generate";
  private accessToken: string;
  private tokenExpiry: number;
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(config: {
    env?: "sandbox" | "production";
    consumerKey: string;
    consumerSecret: string;
  }) {
    this.accessToken = "";
    this.tokenExpiry = Date.now();
    this.baseURL = Daraja.BASE_URL.replace(
      "{}",
      config.env === "production" ? "api" : "sandbox"
    );
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
  }

  private refreshToken = async (): Promise<void> => {
    if (Date.now() >= this.tokenExpiry) {
      try {
        const {
          data: { access_token, expires_in }
        } = await axios.get(Daraja.GENERATE_ACCESS_TOKEN, {
          baseURL: this.baseURL,
          params: { grant_type: "client_credentials" },
          auth: {
            username: this.consumerKey,
            password: this.consumerSecret
          }
        });
        this.accessToken = access_token;
        this.tokenExpiry = Date.now() + +expires_in * 1000;
      } catch (err) {
        throw new Error(err.response.statusText);
      }
    }
  };
}
