import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Currency,
  CurrencySchema,
  ExchangeRate,
  FrankfurterCurrenciesSchema,
} from './currencies.schema';
import { PrismaService } from 'prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const apiUrl = 'https://api.frankfurter.app';

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async onModuleInit() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${apiUrl}/currencies`),
    );
    const currencies = FrankfurterCurrenciesSchema.parse(data);
    const currencyCodes = Object.keys(currencies);

    // Handle currencies
    await this.prisma.currency.deleteMany({
      where: { code: { notIn: currencyCodes } },
    });

    for (const [code, name] of Object.entries(currencies)) {
      await this.prisma.currency.upsert({
        where: { code },
        update: { name },
        create: { code, name },
      });
    }

    const existingPairs = await this.prisma.currencyPair.findMany();

    if (existingPairs.length === 0) {
      for (const fromCode of currencyCodes) {
        for (const toCode of currencyCodes) {
          if (fromCode !== toCode) {
            await this.prisma.currencyPair.create({
              data: {
                fromCode,
                toCode,
                // isEnabled: true,
              },
            });
          }
        }
      }
    } else {
      await this.updatePairs(currencyCodes);
    }
  }

  private async updatePairs(currencyCodes: string[]) {
    await this.prisma.currencyPair.deleteMany({
      where: {
        OR: [
          { fromCode: { notIn: currencyCodes } },
          { toCode: { notIn: currencyCodes } },
        ],
      },
    });

    for (const fromCode of currencyCodes) {
      for (const toCode of currencyCodes) {
        if (fromCode !== toCode) {
          await this.prisma.currencyPair.upsert({
            where: { fromCode_toCode: { fromCode, toCode } },
            update: {},
            create: {
              fromCode,
              toCode,
              // isEnabled: false,
            },
          });
        }
      }
    }
  }

  async findAll(): Promise<Currency[]> {
    const currencies = await this.prisma.currency.findMany();
    return currencies.map((c) => CurrencySchema.parse(c));
  }

  // async listCurrencies() {
  //   const { data } = await firstValueFrom(
  //     this.httpService.get(`${apiUrl}/currencies`),
  //   );
  //   return Object.entries(data).map(([code, name]) => ({
  //     code,
  //     name: name as string,
  //   }));
  // }

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
