import { z } from 'zod';

export const CurrencySchema = z.object({
  id: z.number(),
  code: z.string().min(3).max(3),
  symbol: z.string(),
});

export type Currency = z.infer<typeof CurrencySchema>;
