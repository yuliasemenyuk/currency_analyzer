import { z } from 'zod';

export const AddRuleWithCurrencyCodesSchema = z.object({
  fromCurrencyCode: z.string(),
  toCurrencyCode: z.string(),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
  userId: z.string(),
});

export const RuleBaseSchema = z.object({
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
});

export const CreateRuleRequestSchema = RuleBaseSchema.extend({
  fromCurrencyCode: z.string().length(3),
  toCurrencyCode: z.string().length(3),
});

export const CreateRuleServiceSchema = CreateRuleRequestSchema.extend({
  userId: z.string().uuid(),
});

export const RuleToggleRequestSchema = z.object({
  isEnabled: z.boolean(),
});

export const RuleToggleServiceSchema = RuleToggleRequestSchema.extend({
  userId: z.string().uuid(),
  ruleId: z.string().uuid(),
});

export const RuleResponseSchema = RuleBaseSchema.extend({
  id: z.string().uuid(),
  pairId: z.string().uuid(),
  currencyPair: z.object({
    fromCode: z.string().length(3),
    toCode: z.string().length(3),
  }),
  isEnabled: z.boolean(),
  isArchived: z.boolean(),
});

export const ActiveRuleSchema = z.object({
  id: z.string().uuid(),
  pairId: z.string().uuid(),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
  createdAt: z.date(),
  updatedAt: z.date(),
  isEnabled: z.boolean(),
  users: z.array(
    z.object({
      userId: z.string().uuid(),
      ruleId: z.string().uuid(),
      isEnabled: z.boolean(),
      isArchived: z.boolean(),
      user: z.object({
        email: z.string().email(),
      }),
    }),
  ),
  currencyPair: z.object({
    id: z.string().uuid(),
    fromCode: z.string().length(3),
    toCode: z.string().length(3),
  }),
});

export const RuleListSchema = z.object({
  id: z.string().uuid(),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease']),
  isEnabled: z.boolean(),
  isArchived: z.boolean().optional(),
  currencyPair: z.object({
    fromCode: z.string().length(3),
    toCode: z.string().length(3),
  }),
});

export const RuleArchiveServiceSchema = z.object({
  userId: z.string().uuid(),
  ruleId: z.string().uuid(),
});

export type CreateRuleRequest = z.infer<typeof CreateRuleRequestSchema>;
export type CreateRuleServiceDto = z.infer<typeof CreateRuleServiceSchema>;
export type RuleToggleRequest = z.infer<typeof RuleToggleRequestSchema>;
export type RuleToggleServiceDto = z.infer<typeof RuleToggleServiceSchema>;
export type RuleResponse = z.infer<typeof RuleResponseSchema>;
export type ActiveRule = z.infer<typeof ActiveRuleSchema>;
export type RuleArchiveServiceDto = z.infer<typeof RuleArchiveServiceSchema>;
export type RuleListResponse = z.infer<typeof RuleListSchema>;
export type AddRuleWithCurrencyCodesDto = z.infer<
  typeof AddRuleWithCurrencyCodesSchema
>;
