import nock from "nock";
import "jest-extended";
import "jest-chain";
import Daraja from "../src";

describe("daraja", () => {
  const baseURLRegex = /https:\/\/(sandbox|api)\.safaricom\.co\.ke/;

  beforeAll(() => {
    nock(baseURLRegex)
      .persist()
      .get("/oauth/v1/generate")
      .query(new URLSearchParams({ grant_type: "client_credentials" }))
      .basicAuth({ user: "validKey", pass: "validSecret" })
      .reply(200, { access_token: "accessToken", expires_in: "3599" })
      .get("/oauth/v1/generate")
      .query(new URLSearchParams({ grant_type: "client_credentials" }))
      .basicAuth({ user: "invalidKey", pass: "invalidSecret" })
      .reply(400);
  });

  describe("mpesa express request", () => {
    let daraja: Daraja;

    beforeAll(() => {
      daraja = new Daraja(123456, "validKey", "validSecret", {
        lnmPasskey: "passkey"
      });

      nock(baseURLRegex)
        .persist()
        .matchHeader("Authorization", "Bearer accessToken")
        .post("/mpesa/stkpush/v1/processrequest", {
          BusinessShortCode: 123456,
          Password: /.+/,
          Timestamp: /\d{14}/,
          TransactionType: "CustomerBuyGoodsOnline",
          Amount: 1,
          PartyA: 254712345678,
          PartyB: 123456,
          PhoneNumber: 254712345678,
          CallBackURL: "http://callback.url",
          AccountReference: "ref",
          TransactionDesc: "desc"
        })
        .reply(200, {
          MerchantRequestID: "merchantRequestID",
          CheckoutRequestID: "checkoutRequestID",
          ResponseCode: "0",
          ResponseDescription: "Success. Request accepted for processing",
          CustomerMessage: "Success. Request accepted for processing"
        })
        .post("/mpesa/stkpush/v1/processrequest", {
          BusinessShortCode: 123456,
          Password: /.+/,
          Timestamp: /\d{14}/,
          TransactionType: "CustomerBuyGoodsOnline",
          Amount: 1,
          PartyA: 2547123456789,
          PartyB: 123456,
          PhoneNumber: 2547123456789,
          CallBackURL: "http://callback.url",
          AccountReference: "ref",
          TransactionDesc: "desc"
        })
        .matchHeader("Authorization", "Bearer accessToken")
        .reply(400);
    });

    it("should pass with valid credentials", async () => {
      expect(
        await daraja.mpesaExpressRequest(
          1,
          254712345678,
          "CustomerBuyGoodsOnline",
          {
            callbackURL: "http://callback.url",
            accountReference: "ref",
            transactionDesc: "desc"
          }
        )
      )
        .toBeObject()
        .toContainAllKeys(["merchantRequestID", "checkoutRequestID"]);
    });

    it("should fail with invalid credentials", async () => {
      try {
        await new Daraja(123456, "invalidKey", "invalidSecret", {
          lnmPasskey: "passkey"
        }).mpesaExpressRequest(1, 254712345678, "CustomerBuyGoodsOnline", {
          callbackURL: "http://callback.url",
          accountReference: "ref",
          transactionDesc: "desc"
        });
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });

    it("should fail with invalid params", async () => {
      nock(baseURLRegex)
        .post("/mpesa/stkpush/v1/processrequest", {
          BusinessShortCode: 123456,
          Password: /.+/,
          Timestamp: /\d{14}/,
          TransactionType: "CustomerBuyGoodsOnline",
          Amount: 1,
          PartyA: 2547123456789,
          PartyB: 123456,
          PhoneNumber: 2547123456789,
          CallBackURL: "http://callback.url",
          AccountReference: "ref",
          TransactionDesc: "desc"
        })
        .matchHeader("Authorization", "Bearer accessToken")
        .reply(400);
      try {
        await new Daraja(123456, "validKey", "validSecret", {
          env: "production"
        }).mpesaExpressRequest(1, 2547123456789, "CustomerBuyGoodsOnline", {
          callbackURL: "http://callback.url",
          accountReference: "ref",
          transactionDesc: "desc"
        });
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
