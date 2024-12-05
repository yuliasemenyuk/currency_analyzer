import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Currency,
  CurrencySchema,
  ExchangeRate,
  FrankfurterCurrenciesSchema,
  StartMonitoringPairDto,
  ToggleMonitoredPairDto,
} from './currencies.schema';
import { PrismaService } from 'prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CurrencyPair } from '@prisma/client';

// const apiUrl = 'https://api.frankfurter.app';
const apiUrl = 'https://openexchangerates.org/api';
const API_KEY = process.env.OPEN_EXCHANGE_RATES_API_KEY;

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async onModuleInit() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${apiUrl}/currencies.json?app_id=${API_KEY}`),
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

  async getMonitoredPairs(userId: string): Promise<CurrencyPair[]> {
    const pairs = await this.prisma.currencyPair.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        fromCurrency: true,
        toCurrency: true,
        users: {
          where: { userId },
          select: { userId: true, isEnabled: true },
        },
      },
    });

    return pairs.map((pair) => {
      const user = pair.users.find((user) => user.userId === userId);
      return {
        ...pair,
        isEnabled: user?.isEnabled ?? false,
      };
    });
  }

  async startMonitoringPair(data: StartMonitoringPairDto) {
    const { userId, fromCode, toCode } = data;
    const pair = await this.prisma.currencyPair.findFirst({
      where: {
        fromCode,
        toCode,
      },
    });

    if (!pair) {
      throw new Error('Pair not found');
    }

    await this.prisma.UsersOnPairs.upsert({
      where: {
        userId_pairId: {
          userId,
          pairId: pair.id,
        },
      },
      update: {
        isEnabled: true,
      },
      create: {
        user: { connect: { id: userId } },
        pair: { connect: { id: pair.id } },
        isEnabled: true,
      },
    });
  }

  async disableMonitoredPair(data: ToggleMonitoredPairDto) {
    const { userId, pairId } = data;
    await this.prisma.UsersOnPairs.update({
      where: {
        userId_pairId: {
          userId,
          pairId,
        },
      },
      data: {
        isEnabled: false,
      },
    });
  }

  async enableMonitoredPair(data: ToggleMonitoredPairDto) {
    const { userId, pairId } = data;
    await this.prisma.UsersOnPairs.update({
      where: {
        userId_pairId: {
          userId,
          pairId,
        },
      },
      data: {
        isEnabled: true,
      },
    });
  }

  async getRates(from: string, to: string): Promise<ExchangeRate> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${apiUrl}/latest.json?app_id=${API_KEY}&base=${from}&symbols=${to}`,
      ),
    );
    return {
      fromCurrency: from,
      toCurrency: to,
      rate: data.rates[to],
      lastUpdated: new Date(data.timestamp * 1000).toISOString(),
      bid: data.rates[to],
      ask: data.rates[to],
    };
  }

  async getCurrencyRate(fromCurrencyCode: string, toCurrencyCode: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${apiUrl}/latest.json?app_id=${API_KEY}&base=${fromCurrencyCode}&symbols=${toCurrencyCode}`,
      ),
    );
    return data.rates[toCurrencyCode];
  }
}
