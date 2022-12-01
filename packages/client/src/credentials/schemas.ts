import { z } from 'zod';

import { stringSchema } from '~common/schemas';

export const darajaCredentialsConfigSchema = z.object({
  consumerKey: stringSchema,
  consumerSecret: stringSchema,
  environment: z
    .literal('sandbox')
    .or(z.literal('production'))
    .optional()
    .default('sandbox'),
});
