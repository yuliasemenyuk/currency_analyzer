import { z } from "zod";

export const CurrencySchema = z.object({
  id: z.string(),
  code: z.string().length(3),
  name: z.string(),
});

export const AddRuleWithCurrencyCodesSchema = z.object({
  fromCurrencyCode: z.string(),
  toCurrencyCode: z.string(),
  percentage: z.number().positive(),
  trendDirection: z.enum(["increase", "decrease"]),
  userId: z.string(),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type AddRuleWithCurrencyCodesDto = z.infer<
  typeof AddRuleWithCurrencyCodesSchema
>;
