import { DarajaCredentialsError } from '~common/errors';
import DarajaCredentials from '~credentials/credentials';

describe('DarajaCredentials', () => {
  const consumerKey = 'consumerKey';
  const consumerSecret = 'consumerSecret';
  let credentials: DarajaCredentials;

  describe('constructor', () => {
    describe('when "consumerKey" and "consumerSecret" are valid', () => {
      it('should return a sandbox instance when the value of environment is "sandbox"', () => {
        expect(
          new DarajaCredentials({
            consumerKey,
            consumerSecret,
            environment: 'sandbox',
          })
        ).toBeInstanceOf(DarajaCredentials);
      });

      it('should return a production instance when the value of environment is "production"', () => {
        expect(
          new DarajaCredentials({
            consumerKey,
            consumerSecret,
            environment: 'production',
          })
        ).toBeInstanceOf(DarajaCredentials);
      });
    });
  });

  describe('getAccessToken', () => {
    describe('when the credentials are valid', () => {
      beforeEach(() => {
        credentials = new DarajaCredentials({ consumerKey, consumerSecret });
      });

      it('should resolve to an object', async () => {
        await expect(credentials.getAccessToken()).resolves.toEqual({
          accessToken: '0lfGXGBYMizXb4q5lEoK5duYRZ0O',
          expiresIn: 3599,
        });
      });
    });

    describe('when the credentials are invalid', () => {
      beforeEach(() => {
        credentials = new DarajaCredentials({
          consumerKey,
          consumerSecret: 'invalidSecret',
        });
      });

      it('should reject with a "DarajaCredentialsError"', async () => {
        await expect(credentials.getAccessToken()).rejects.toThrow(
          new DarajaCredentialsError('Bad Request: Invalid Credentials')
        );
      });
    });
  });
});
