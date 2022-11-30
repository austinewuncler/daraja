import axios, { AxiosError, AxiosInstance } from 'axios';

import { DarajaCredentialsError } from '~common/errors';
import { validateInput } from '~common/utils';

import { darajaCredentialsConfigSchema } from './schemas';
import type {
  AccessTokenApiResponse,
  AccessTokenResponse,
  DarajaCredentialsConfig,
} from './types';

export default class DarajaCredentials {
  private readonly http: AxiosInstance;

  constructor(options: DarajaCredentialsConfig) {
    const { consumerKey, consumerSecret, environment } = validateInput(
      options,
      darajaCredentialsConfigSchema
    );
    this.http = axios.create({
      baseURL: `https://${
        environment === 'production' ? 'api' : 'sandbox'
      }.safaricom.co.ke`,
      params: { grant_type: 'client_credentials' },
      auth: { username: consumerKey, password: consumerSecret },
    });
  }

  getAccessToken = async (): Promise<AccessTokenResponse> => {
    try {
      const { data } = await this.http.get<AccessTokenApiResponse>(
        '/oauth/v1/generate'
      );
      return {
        accessToken: data.access_token,
        expiresIn: parseInt(data.expires_in),
      };
    } catch (error: any) {
      throw new DarajaCredentialsError(
        (error as AxiosError).response?.statusText
      );
    }
  };
}
