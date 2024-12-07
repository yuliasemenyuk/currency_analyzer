import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Currency,
  CurrencySchema,
  CurrenciesResponseSchema,
  ExchangeRate,
  StartMonitoringPairDto,
  ToggleMonitoredPairDto,
} from './currencies.schema';
import { PrismaService } from 'prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CurrencyPair } from '@prisma/client';
import {
  InvalidCurrencyDataError,
  DuplicatePairError,
  SameCurrencyError,
  PairNotFoundError,
} from './currencies.errors';

// const apiUrl = 'https://api.frankfurter.app';
const apiUrl = 'https://openexchangerates.org/api';
const API_KEY = process.env.OPEN_EXCHANGE_RATES_API_KEY;

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  // async onModuleInit() {
  //   try {
  //     const { data } = await firstValueFrom(
  //       this.httpService.get(`${apiUrl}/currencies.json?app_id=${API_KEY}`),
  //     );
  //     const parsedData = CurrenciesResponseSchema.safeParse(data);
  //     if (!parsedData.success) {
  //       throw new InvalidCurrencyDataError();
  //     }

  //     const currencies = parsedData.data;
  //     const currencyCodes = Object.keys(currencies);

  //     await this.deleteRulesWithNonExistingPairs(currencyCodes);

  //     await this.deletePairsWithNonExistingCurrencies(currencyCodes);

  //     await this.prisma.currency.deleteMany({
  //       where: { code: { notIn: currencyCodes } },
  //     });

  //     for (const [code, name] of Object.entries(currencies)) {
  //       await this.prisma.currency.upsert({
  //         where: { code },
  //         update: { name },
  //         create: { code, name },
  //       });
  //     }

  //     const existingPairs = await this.prisma.currencyPair.findMany();
  //     if (existingPairs.length === 0) {
  //       for (const fromCode of currencyCodes) {
  //         for (const toCode of currencyCodes) {
  //           if (fromCode !== toCode) {
  //             await this.prisma.currencyPair.create({
  //               data: {
  //                 fromCode,
  //                 toCode,
  //               },
  //             });
  //           }
  //         }
  //       }
  //     } else {
  //       await this.updatePairs(currencyCodes);
  //     }
  //   } catch (error) {
  //     if (error instanceof InvalidCurrencyDataError) {
  //       throw error;
  //     }
  //     throw new Error(
  //       `Failed to initialize currencies: ${(error as Error).message}`,
  //     );
  //   }
  // }

  // private async updatePairs(currencyCodes: string[]) {
  //   // await this.prisma.currencyPair.deleteMany({
  //   //   where: {
  //   //     OR: [
  //   //       { fromCode: { notIn: currencyCodes } },
  //   //       { toCode: { notIn: currencyCodes } },
  //   //     ],
  //   //   },
  //   // });

  //   for (const fromCode of currencyCodes) {
  //     for (const toCode of currencyCodes) {
  //       if (fromCode !== toCode) {
  //         await this.prisma.currencyPair.upsert({
  //           where: { fromCode_toCode: { fromCode, toCode } },
  //           update: {},
  //           create: {
  //             fromCode,
  //             toCode,
  //           },
  //         });
  //       }
  //     }
  //   }
  // }

  // private async deleteRulesWithNonExistingPairs(currencyCodes: string[]) {
  //   const pairsToDelete = await this.prisma.currencyPair.findMany({
  //     where: {
  //       OR: [
  //         { fromCode: { notIn: currencyCodes } },
  //         { toCode: { notIn: currencyCodes } },
  //       ],
  //     },
  //     select: { id: true },
  //   });
  //   const pairIdsToDelete = pairsToDelete.map((pair) => pair.id);

  //   await this.prisma.usersOnRules.deleteMany({
  //     where: {
  //       rule: {
  //         pairId: { in: pairIdsToDelete },
  //       },
  //     },
  //   });

  //   await this.prisma.rule.deleteMany({
  //     where: {
  //       pairId: { in: pairIdsToDelete },
  //     },
  //   });
  // }

  // private async deletePairsWithNonExistingCurrencies(currencyCodes: string[]) {
  //   const pairsToDelete = await this.prisma.currencyPair.findMany({
  //     where: {
  //       OR: [
  //         { fromCode: { notIn: currencyCodes } },
  //         { toCode: { notIn: currencyCodes } },
  //       ],
  //     },
  //     select: { id: true },
  //   });
  //   const pairIdsToDelete = pairsToDelete.map((pair) => pair.id);

  //   await this.prisma.currencyRateHistory.deleteMany({
  //     where: {
  //       pairId: { in: pairIdsToDelete },
  //     },
  //   });

  //   await this.prisma.usersOnPairs.deleteMany({
  //     where: {
  //       pairId: { in: pairIdsToDelete },
  //     },
  //   });

  //   await this.prisma.currencyPair.deleteMany({
  //     where: {
  //       id: { in: pairIdsToDelete },
  //     },
  //   });
  // }

  async onModuleInit() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${apiUrl}/currencies.json?app_id=${API_KEY}`),
      );
      const parsedData = CurrenciesResponseSchema.safeParse(data);
      if (!parsedData.success) {
        throw new InvalidCurrencyDataError();
      }

      const currencies = parsedData.data;
      const currencyCodes = Object.keys(currencies);

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
                },
              });
            }
          }
        }
      } else {
        await this.updatePairs(currencyCodes);
      }
    } catch (error) {
      if (error instanceof InvalidCurrencyDataError) {
        throw error;
      }
      throw new Error(
        `Failed to initialize currencies: ${(error as Error).message}`,
      );
    }
  }

  private async updatePairs(currencyCodes: string[]) {
    for (const fromCode of currencyCodes) {
      for (const toCode of currencyCodes) {
        if (fromCode !== toCode) {
          await this.prisma.currencyPair.upsert({
            where: { fromCode_toCode: { fromCode, toCode } },
            update: {},
            create: {
              fromCode,
              toCode,
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
    console.log('userId', userId);
    console.log('fromCode', fromCode);
    console.log('toCode', toCode);
    if (fromCode === toCode) {
      throw new SameCurrencyError(fromCode, toCode);
    }
    const pair = await this.prisma.currencyPair.findFirst({
      where: {
        fromCode,
        toCode,
      },
    });

    if (!pair) {
      throw new PairNotFoundError(pair.id);
    }

    const existingSubscription = await this.prisma.UsersOnPairs.findUnique({
      where: {
        userId_pairId: {
          userId,
          pairId: pair.id,
        },
      },
    });

    if (existingSubscription) {
      throw new DuplicatePairError(fromCode, toCode);
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
