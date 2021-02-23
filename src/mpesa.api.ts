import axios from "axios";

export type Env = "sandbox" | "production";

export interface IMpesaAPIConfig {
  readonly env?: Env;
  readonly lnmPasskey?: string;
}

export class MpesaAPIError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default class MpesaAPI {
  private accessToken: string;
  private tokenExpiry: number;
  private baseURL: string;
  private lnmPasskey?: string;

  constructor(
    private shortcode: number,
    private consumerKey: string,
    private consumerSecret: string,
    config: IMpesaAPIConfig
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
        throw new MpesaAPIError(err.response.statusText);
      }
    }
  };

  mpesaExpressRequest = async (
    amount: string | number,
    partyA: number,
    transactionType: "CustomerBuyGoodsOnline" | "CustomerPayBillOnline",
    options: {
      partyB?: string | number;
      phoneNumber?: string | number;
      callbackURL: string;
      accountReference: string;
      transactionDesc: string;
    }
  ): Promise<{ merchantRequestID: string; checkoutRequestID: string }> => {
    await this.refreshToken();
    const currentTimestamp = MpesaAPI.generateTimestamp(new Date());
    try {
      const {
        data: {
          MerchantRequestID: merchantRequestID,
          CheckoutRequestID: checkoutRequestID
        }
      } = await axios.post(
        "/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: +this.shortcode,
          Password: Buffer.from(
            `${this.shortcode}${this.lnmPasskey}${currentTimestamp}`
          ).toString("base64"),
          Timestamp: currentTimestamp,
          TransactionType: transactionType,
          Amount: +amount,
          PartyA: +partyA,
          PartyB: options.partyB || +this.shortcode,
          PhoneNumber: options.phoneNumber || +partyA,
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
      throw new MpesaAPIError(err.response.data.errorMessage);
    }
  };

  mpesaExpressQuery = async (
    checkoutRequestId: string
  ): Promise<{
    merchantRequestID: string;
    checkoutRequestID: string;
    resultCode: string;
    resultDesc: string;
  }> => {
    await this.refreshToken();
    const currentTimestamp = MpesaAPI.generateTimestamp(new Date());
    try {
      const {
        data: {
          MerchantRequestID: merchantRequestID,
          CheckoutRequestID: checkoutRequestID,
          ResultCode: resultCode,
          ResultDesc: resultDesc
        }
      } = await axios.post(
        "/mpesa/stkpushquery/v1/query",
        {
          BusinessShortCode: +this.shortcode,
          Password: Buffer.from(
            `${this.shortcode}${this.lnmPasskey}${currentTimestamp}`
          ).toString("base64"),
          Timestamp: currentTimestamp,
          CheckoutRequestID: checkoutRequestId
        },
        {
          baseURL: this.baseURL,
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
      return { merchantRequestID, checkoutRequestID, resultCode, resultDesc };
    } catch (err) {
      throw new MpesaAPIError(err.response.data.errorMessage);
    }
  };
}
