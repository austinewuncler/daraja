import axios from "axios";

export default class Daraja {
  static GENERATE_ACCESS_TOKEN = "oauth/v1/generate";
  static MPESA_EXPRESS_REQUEST = "mpesa/stkpush/v1/processrequest";
  private accessToken: string;
  private tokenExpiry: number;
  private baseURL: string;
  private lnmPasskey?: string;

  constructor(
    private shortcode: number,
    private consumerKey: string,
    private consumerSecret: string,
    config: {
      env?: "sandbox" | "production";
      lnmPasskey?: string;
    }
  ) {
    this.accessToken = "";
    this.tokenExpiry = Date.now();
    this.baseURL = `https://${
      config.env === "production" ? "api" : "sandbox"
    }.safaricom.co.ke`;
    this.lnmPasskey = config.lnmPasskey;
  }

  private static generateTimestamp = (date: Date) =>
    `${date.getFullYear()}` +
    `${date.getMonth() + 1}`.padStart(2, "0") +
    `${date.getDate()}`.padStart(2, "0") +
    `${date.getHours()}`.padStart(2, "0") +
    `${date.getMinutes()}`.padStart(2, "0") +
    `${date.getSeconds()}`.padStart(2, "0");

  private refreshToken = async (): Promise<void> => {
    if (Date.now() >= this.tokenExpiry) {
      try {
        const {
          data: { access_token, expires_in }
        } = await axios.get("/oauth/v1/generate", {
          baseURL: this.baseURL,
          params: new URLSearchParams({
            grant_type: "client_credentials"
          }),
          auth: { username: this.consumerKey, password: this.consumerSecret }
        });
        this.accessToken = access_token;
        this.tokenExpiry = Date.now() + +expires_in * 1000;
      } catch (err) {
        throw new Error(err.response.statusText);
      }
    }
  };

  mpesaExpressRequest = async (
    amount: number,
    partyA: number,
    transactionType: "CustomerBuyGoodsOnline" | "CustomerPayBillOnline",
    options: {
      partyB?: number;
      phoneNumber?: number;
      callbackURL: string;
      accountReference: string;
      transactionDesc: string;
    }
  ): Promise<{ merchantRequestID: string; checkoutRequestID: string }> => {
    await this.refreshToken();
    const currentTimestamp = Daraja.generateTimestamp(new Date());
    try {
      const {
        data: {
          MerchantRequestID: merchantRequestID,
          CheckoutRequestID: checkoutRequestID
        }
      } = await axios.post(
        "/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: this.shortcode,
          Password: Buffer.from(
            `${this.shortcode}${this.lnmPasskey}${currentTimestamp}`
          ).toString("base64"),
          Timestamp: currentTimestamp,
          TransactionType: transactionType,
          Amount: amount,
          PartyA: partyA,
          PartyB: options.partyB || this.shortcode,
          PhoneNumber: options.phoneNumber || partyA,
          CallBackURL: options.callbackURL,
          AccountReference: options.accountReference,
          TransactionDesc: options.transactionDesc
        },
        {
          baseURL: this.baseURL,
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
      return { merchantRequestID, checkoutRequestID };
    } catch (err) {
      throw new Error(err.response.data.errorMessage);
    }
  };
}
