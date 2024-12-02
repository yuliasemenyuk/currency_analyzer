import { Injectable } from '@nestjs/common';
import { Currency, CurrencySchema, ExchangeRate } from './currencies.schema';
import { PrismaService } from 'prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const apiUrl = 'https://api.frankfurter.app';

@Injectable()
export class CurrenciesService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async findAll(): Promise<Currency[]> {
    const currencies = await this.prisma.currency.findMany();
    return currencies.map((c) => CurrencySchema.parse(c));
  }

  async listCurrencies() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${apiUrl}/currencies`),
    );
    return Object.entries(data).map(([code, name]) => ({
      code,
      name: name as string,
    }));
  }

  async getRates(from: string, to: string): Promise<ExchangeRate> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${apiUrl}/latest?from=${from}&to=${to}`),
    );
    return {
      fromCurrency: data.base,
      toCurrency: to,
      rate: data.rates[to],
      lastUpdated: data.date,
      bid: data.rates[to],
      ask: data.rates[to],
    };
  }
}
