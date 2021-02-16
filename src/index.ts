import got from "got";

export default class Daraja {
  static BASE_URL = "https://{}.safaricom.co.ke";
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
    this.baseURL = Daraja.BASE_URL.replace(
      "{}",
      config.env === "production" ? "api" : "sandbox"
    );
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
        const { access_token, expires_in } = await got
          .get(Daraja.GENERATE_ACCESS_TOKEN, {
            prefixUrl: this.baseURL,
            searchParams: new URLSearchParams({
              grant_type: "client_credentials"
            }),
            username: this.consumerKey,
            password: this.consumerSecret
          })
          .json();
        this.accessToken = access_token;
        this.tokenExpiry = Date.now() + +expires_in * 1000;
      } catch (err) {
        throw new Error(err.response.statusMessage);
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
        MerchantRequestID: merchantRequestID,
        CheckoutRequestID: checkoutRequestID
      } = await got
        .post(Daraja.MPESA_EXPRESS_REQUEST, {
          prefixUrl: this.baseURL,
          json: {
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
          headers: { Authorization: `Bearer ${this.accessToken}` }
        })
        .json();
      return { merchantRequestID, checkoutRequestID };
    } catch (err) {
      throw new Error(JSON.parse(err.response.body).errorMessage);
    }
  };
}
