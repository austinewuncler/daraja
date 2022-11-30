import { z } from 'zod';

export const stringSchema = z.string().trim().min(1);
