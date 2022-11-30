import { z } from 'zod';

import { DarajaValidationError } from '~common/errors';
import { validateInput } from '~common/utils';

describe('commonUtils', () => {
  describe('validateInput', () => {
    const schema = z.object({ name: z.string().min(1) });

    describe('when validation succeeds', () => {
      it('should return an object that matches the input', () => {
        const input = { name: 'name' };
        expect(validateInput(input, schema)).toEqual(input);
      });
    });

    describe('when validation fails', () => {
      it('should throw a "DarajaValidationError"', () => {
        expect(() => validateInput({ name: '' }, schema)).toThrow(
          new DarajaValidationError(
            'Validation error: String must contain at least 1 character(s) at "name"'
          )
        );
      });
    });
  });
});
