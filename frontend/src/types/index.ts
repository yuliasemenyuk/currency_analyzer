import { z } from "zod";

export const TrendDirectionSchema = z.enum(['increase', 'decrease']);

export const CurrencySchema = z.object({
  id: z.string(),
  code: z.string().length(3),
  name: z.string(),
});

export const CurrencyPairSchema = z.object({
    id: z.string(),
    fromCurrencyId: z.string(),
    toCurrencyId: z.string(),
    fromCode:  z.string().length(3),
    toCode:  z.string().length(3),
    isEnabled: z.boolean()
  })

export const RuleSchema = z.object({
    id: z.string().uuid(),
    currencyPair: z.object({
      fromCode: z.string().length(3),
      toCode: z.string().length(3)
    }),
    percentage: z.number().min(0).max(100),
    trendDirection: TrendDirectionSchema,
    isEnabled: z.boolean()
   });

export const AddRuleWithCurrencyCodesSchema = z.object({
  fromCurrencyCode: z.string(),
  toCurrencyCode: z.string(),
  percentage: z.number().positive(),
  trendDirection: z.enum(["increase", "decrease"]),
  // userId: z.string(),
});

export type TrendDirection = z.infer<typeof TrendDirectionSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type CurrencyPair = z.infer<typeof CurrencyPairSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type AddRuleWithCurrencyCodesDto = z.infer<
  typeof AddRuleWithCurrencyCodesSchema
>;
