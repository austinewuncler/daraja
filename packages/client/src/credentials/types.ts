import type { z } from 'zod';

import type { darajaCredentialsConfigSchema } from './schemas';

export type DarajaCredentialsConfig = z.input<
  typeof darajaCredentialsConfigSchema
>;

export interface AccessTokenApiResponse {
  access_token: string;
  expires_in: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  expiresIn: number;
}
