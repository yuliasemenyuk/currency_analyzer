import { z } from 'zod';

export const AddRuleWithCurrencyIdsSchema = z.object({
  fromCurrencyCode: z.string(),
  toCurrencyCode: z.string(),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
  userId: z.string(),
});

export const AddRuleWithPairIdSchema = z.object({
  pairId: z.string(),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
  userId: z.string(),
});

export type AddRuleWithCurrencyIdsDto = z.infer<
  typeof AddRuleWithCurrencyIdsSchema
>;
export type AddRuleWithPairIdDto = z.infer<typeof AddRuleWithPairIdSchema>;
