import axios from "axios";

export default class Daraja {
  static BASE_URL = "https://{}.safaricom.co.ke";
  static GENERATE_ACCESS_TOKEN = "/oauth/v1/generate";
  static MPESA_EXPRESS_REQUEST = "/mpesa/stkpush/v1/processrequest";
  private accessToken: string;
  private tokenExpiry: number;
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private lnmPasskey?: string;

  constructor(
    private shortcode: number,
    config: {
      env?: "sandbox" | "production";
      consumerKey: string;
      consumerSecret: string;
      lnmPasskey: string;
    }
  ) {
    this.accessToken = "";
    this.tokenExpiry = Date.now();
    this.baseURL = Daraja.BASE_URL.replace(
      "{}",
      config.env === "production" ? "api" : "sandbox"
    );
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
  }

  private static generateTimestamp = (date: Date) =>
    `${date.getFullYear()}` +
    `${date.getMonth() + 1}`.padStart(2, "0") +
    `${date.getDate()}`.padStart(2, "0") +
    `${date.getHours()}`.padStart(2, "0") +
    `${date.getMinutes()}`.padStart(2, "0") +
    `${date.getSeconds()}`.padStart(2, "0");

  private refreshToken = async () => {
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
        console.log(this.consumerKey + " " + this.consumerSecret);
        this.accessToken = access_token;
        this.tokenExpiry = Date.now() + +expires_in * 1000;
      } catch (err) {
        throw new Error(err.response.statusText);
      }
    }
  };

  mpesaExpressRequest = async (options: {
    amount: number;
    senderMSISDN: number;
    recipientShortcode?: number;
    stkPushMSISDN?: number;
    transactionType: "CustomerBuyGoodsOnline" | "CustomerPayBillOnline";
    callbackURL: string;
    accountReference: string;
    transactionDesc: string;
  }): Promise<{ merchantRequestID: string; checkoutRequestID: string }> => {
    await this.refreshToken();
    const currentTimestamp = Daraja.generateTimestamp(new Date());
    try {
      const {
        data: {
          MerchantRequestID: merchantRequestID,
          CheckoutRequestID: checkoutRequestID
        }
      } = await axios.post(
        Daraja.MPESA_EXPRESS_REQUEST,
        {
          BusinessShortCode: this.shortcode,
          Password: Buffer.from(
            `${this.shortcode}${this.lnmPasskey}${currentTimestamp}`
          ).toString("base64"),
          Timestamp: currentTimestamp,
          TransactionType: options.transactionType,
          Amount: options.amount,
          PartyA: options.senderMSISDN,
          PartyB: options.recipientShortcode || this.shortcode,
          PhoneNumber: options.stkPushMSISDN || options.senderMSISDN,
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
