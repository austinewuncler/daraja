import type { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { DarajaValidationError } from './errors';

export const validateInput = <Input, Output>(
  entity: Input,
  schema: z.ZodType<Output, z.ZodTypeDef, Input>
): Output => {
  try {
    return schema.parse(entity);
  } catch (error: any) {
    throw new DarajaValidationError(fromZodError(error).message);
  }
};
