// import { ExchangeRateResponse } from 'src/modules/currencies/currencies.schema';

// interface ExchangeRate {
//   fromCurrency: string;
//   toCurrency: string;
//   rate: number;
//   lastUpdated: string;
//   bid: number;
//   ask: number;
// }

// export const transformResponse = (data: ExchangeRateResponse): ExchangeRate => {
//   const rate = data['Realtime Currency Exchange Rate'];
//   return {
//     fromCurrency: rate['1. From_Currency Code'],
//     toCurrency: rate['3. To_Currency Code'],
//     rate: parseFloat(rate['5. Exchange Rate']),
//     lastUpdated: rate['6. Last Refreshed'],
//     bid: parseFloat(rate['8. Bid Price']),
//     ask: parseFloat(rate['9. Ask Price']),
//   };
// };
