import { z } from 'zod';

export const CurrencySchema = z.object({
  id: z.string().uuid(),
  code: z.string().length(3),
  name: z.string().min(1),
});

export const CurrenciesResponseSchema = z.record(
  z.string().length(3),
  z.string().min(1),
);

export const MonitoredPairResponseSchema = z.object({
  id: z.string().uuid(),
  fromCode: z.string().length(3),
  toCode: z.string().length(3),
  isEnabled: z.boolean(),
});

export const MonitoringPairRequestSchema = z.object({
  fromCode: z.string().length(3),
  toCode: z.string().length(3),
});

export const MonitoringPairServiceSchema = MonitoringPairRequestSchema.extend({
  userId: z.string().uuid(),
});

export const ToggleMonitorRequestSchema = z.object({
  pairId: z.string().uuid(),
});

export const ToggleMonitorServiceSchema = ToggleMonitorRequestSchema.extend({
  userId: z.string().uuid(),
});

export const CurrencyPairSchema = z.object({
  id: z.string().uuid(),
  fromCode: z.string().length(3),
  toCode: z.string().length(3),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type CurrenciesResponse = z.infer<typeof CurrenciesResponseSchema>;
export type MonitoredPairResponse = z.infer<typeof MonitoredPairResponseSchema>;
export type MonitoringPairRequest = z.infer<typeof MonitoringPairRequestSchema>;
export type MonitoringPairServiceDto = z.infer<
  typeof MonitoringPairServiceSchema
>;
export type ToggleMonitorRequest = z.infer<typeof ToggleMonitorRequestSchema>;
export type ToggleMonitorServiceDto = z.infer<
  typeof ToggleMonitorServiceSchema
>;
export type CurrencyPair = z.infer<typeof CurrencyPairSchema>;
