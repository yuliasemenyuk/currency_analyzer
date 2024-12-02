import { z } from 'zod';

export const AddRuleSchema = z.object({
  pairId: z.string(),
  percentage: z.number().positive(),
  trendDirection: z.enum(['increase', 'decrease', 'no_change']),
  userId: z.string(),
});

export type AddRuleDto = z.infer<typeof AddRuleSchema>;
