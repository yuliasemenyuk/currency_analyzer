import { z } from 'zod';

export const CurrencySchema = z.object({
  id: z.string().uuid(),
  code: z.string().length(3),
  name: z.string().min(1),
});

// export const ExchangeRateResponseSchema = z.object({
//   'Realtime Currency Exchange Rate': z.object({
//     '1. From_Currency Code': z.string(),
//     '2. From_Currency Name': z.string(),
//     '3. To_Currency Code': z.string(),
//     '4. To_Currency Name': z.string(),
//     '5. Exchange Rate': z.string(),
//     '6. Last Refreshed': z.string(),
//     '7. Time Zone': z.string(),
//     '8. Bid Price': z.string(),
//     '9. Ask Price': z.string(),
//   }),
// });
export const FrankfurterResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  date: z.string(),
  rates: z.record(z.number()),
});

export const FrankfurterCurrenciesSchema = z.record(z.string());

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

export type Currency = z.infer<typeof CurrencySchema>;
export type FrankfurterResponse = z.infer<typeof FrankfurterResponseSchema>;
export type FrankfurterCurrencies = z.infer<typeof FrankfurterCurrenciesSchema>;
// export type ExchangeRateResponse = z.infer<typeof ExchangeRateResponseSchema>;
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
