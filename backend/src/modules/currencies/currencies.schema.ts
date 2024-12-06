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

export const ExchangeRateSchema = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
  rate: z.number(),
  lastUpdated: z.string(),
  bid: z.number(),
  ask: z.number(),
});

export const RateQuerySchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
});

export const StartMonitoringPairSchema = z.object({
  userId: z.string().uuid(),
  fromCode: z.string().length(3),
  toCode: z.string().length(3),
});

export const ToggleMonitoredPairSchema = z.object({
  userId: z.string().uuid(),
  pairId: z.string().uuid(),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type CurrenciesResponse = z.infer<typeof CurrenciesResponseSchema>;
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
export type StartMonitoringPairDto = z.infer<typeof StartMonitoringPairSchema>;
export type ToggleMonitoredPairDto = z.infer<typeof ToggleMonitoredPairSchema>;
