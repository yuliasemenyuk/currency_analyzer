import { z } from 'zod';

export const AddRuleWithCurrencyCodesSchema = z.object({
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

export const ActiveRuleSchema = z.object({
  id: z.string(),
  pairId: z.string(),
  currencyPair: z.object({
    fromCode: z.string(),
    toCode: z.string(),
  }),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
  users: z.array(
    z.object({
      user: z.object({
        email: z.string().email(),
      }),
    }),
  ),
});

export const ToggleRuleSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  isEnabled: z.boolean(),
});

export type AddRuleWithCurrencyCodesDto = z.infer<
  typeof AddRuleWithCurrencyCodesSchema
>;
export type AddRuleWithPairIdDto = z.infer<typeof AddRuleWithPairIdSchema>;
export type ActiveRuleDto = z.infer<typeof ActiveRuleSchema>;
