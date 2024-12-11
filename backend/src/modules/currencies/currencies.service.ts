import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  Currency,
  CurrencySchema,
  MonitoredPairResponse,
  CurrenciesResponseSchema,
  // ExchangeRateSchema,
  // ExchangeRate,
  MonitoringPairServiceDto,
  ToggleMonitorServiceDto,
  CurrencyPair,
} from './currencies.schema';
import { PrismaService } from 'prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// import { CurrencyPair } from '@prisma/client';
import {
  InvalidCurrencyDataError,
  DuplicatePairError,
  SameCurrencyError,
  PairNotFoundError,
} from './currencies.errors';

const apiUrl = 'https://openexchangerates.org/api';
const API_KEY = process.env.OPEN_EXCHANGE_RATES_API_KEY;

@Injectable()
export class CurrenciesService implements OnModuleInit {
  private readonly logger = new Logger(CurrenciesService.name);
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

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

      await this.prisma.currency.createMany({
        data: Object.entries(currencies).map(([code, name]) => ({
          code,
          name,
        })),
        skipDuplicates: true,
      });

      function generatePairs(
        array1: string[],
        array2: string[],
      ): { fromCode: string; toCode: string }[] {
        const pairs = [];
        for (const fromCode of array1) {
          for (const toCode of array2) {
            if (fromCode !== toCode) {
              pairs.push({ fromCode, toCode });
            }
          }
        }
        return pairs;
      }
      const pairsToCreate = generatePairs(currencyCodes, currencyCodes);
      await this.prisma.currencyPair.createMany({
        data: pairsToCreate,
        skipDuplicates: true,
      });
    } catch (error) {
      if (error instanceof InvalidCurrencyDataError) {
        this.logger.error(
          'Invalid currency data received from API',
          error.stack,
        );
      } else {
        this.logger.error(
          'Failed to initialize currencies',
          (error as Error).stack,
        );
      }
    }
  }

  async findAll(): Promise<Currency[]> {
    try {
      const currencies = await this.prisma.currency.findMany();
      return currencies.map((c) => {
        try {
          return CurrencySchema.parse(c);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          throw new InvalidCurrencyDataError();
        }
      });
    } catch (error) {
      if (error instanceof InvalidCurrencyDataError) {
        throw error;
      }
      throw new Error('Failed to fetch currencies');
    }
  }

  async getMonitoredPairs(userId: string): Promise<MonitoredPairResponse[]> {
    try {
      const pairs = await this.prisma.currencyPair.findMany({
        where: {
          users: {
            some: { userId },
          },
        },
        include: {
          users: {
            where: { userId },
          },
        },
      });

      console.log(pairs, 'PAIRS');

      return pairs.map(({ users, ...rest }) => ({
        ...rest,
        isEnabled: users[0]?.isEnabled ?? false,
      }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to fetch monitored pairs');
    }
  }

  async startMonitoringPair(data: MonitoringPairServiceDto): Promise<void> {
    const { userId, fromCode, toCode } = data;

    try {
      if (fromCode === toCode) {
        throw new SameCurrencyError(fromCode, toCode);
      }

      const pair = await this.prisma.currencyPair.findFirst({
        where: { fromCode, toCode },
      });

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

      await this.prisma.UsersOnPairs.create({
        data: {
          user: { connect: { id: userId } },
          pair: { connect: { id: pair.id } },
          isEnabled: true,
        },
      });
    } catch (error) {
      console.log(error, 'error');
      if (
        error instanceof SameCurrencyError ||
        error instanceof DuplicatePairError
      ) {
        throw error;
      }
      throw new Error('Failed to start monitoring pair');
    }
  }

  async disableMonitoredPair(data: ToggleMonitorServiceDto) {
    const { userId, pairId } = data;

    try {
      const subscription = await this.prisma.UsersOnPairs.findUnique({
        where: {
          userId_pairId: { userId, pairId },
        },
      });

      if (!subscription) {
        throw new PairNotFoundError(pairId);
      }

      return await this.prisma.UsersOnPairs.update({
        where: {
          userId_pairId: { userId, pairId },
        },
        data: {
          isEnabled: false,
        },
      });
    } catch (error) {
      if (error instanceof PairNotFoundError) {
        throw error;
      }
      throw new Error('Failed to disable pair monitoring');
    }
  }

  async enableMonitoredPair(data: ToggleMonitorServiceDto) {
    const { userId, pairId } = data;

    try {
      const subscription = await this.prisma.UsersOnPairs.findUnique({
        where: {
          userId_pairId: { userId, pairId },
        },
      });

      if (!subscription) {
        throw new PairNotFoundError(pairId);
      }

      return await this.prisma.UsersOnPairs.update({
        where: {
          userId_pairId: { userId, pairId },
        },
        data: {
          isEnabled: true,
        },
      });
    } catch (error) {
      if (error instanceof PairNotFoundError) {
        throw error;
      }
      throw new Error('Failed to enable pair monitoring');
    }
  }

  async deleteMonitoredPair(userId: string, pairId: string) {
    try {
      const subscription = await this.prisma.UsersOnPairs.findUnique({
        where: {
          userId_pairId: { userId, pairId },
        },
      });

      if (!subscription) {
        throw new PairNotFoundError(pairId);
      }

      await this.prisma.UsersOnPairs.delete({
        where: {
          userId_pairId: { userId, pairId },
        },
      });

      await this.prisma.usersOnRules.deleteMany({
        where: {
          userId,
          rule: {
            currencyPair: {
              id: pairId,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      if (error instanceof PairNotFoundError) {
        throw error;
      }
      throw new Error('Failed to delete monitored pair');
    }
  }

  // async getRates(from: string, to: string): Promise<ExchangeRate> {
  //   try {
  //     const { data } = await firstValueFrom(
  //       this.httpService.get(
  //         `${apiUrl}/latest.json?app_id=${API_KEY}&base=${from}&symbols=${to}`,
  //       ),
  //     );

  //     if (!data.rates || !data.rates[to]) {
  //       throw new InvalidCurrencyDataError();
  //     }

  //     const rateData = {
  //       fromCurrency: from,
  //       toCurrency: to,
  //       rate: data.rates[to],
  //       lastUpdated: new Date(data.timestamp * 1000).toISOString(),
  //       bid: data.rates[to],
  //       ask: data.rates[to],
  //     };

  //     const validated = ExchangeRateSchema.safeParse(rateData);
  //     if (!validated.success) {
  //       throw new InvalidCurrencyDataError();
  //     }

  //     return validated.data;
  //   } catch (error) {
  //     if (error instanceof InvalidCurrencyDataError) {
  //       throw error;
  //     }
  //     throw new Error('Failed to fetch exchange rates');
  //   }
  // }

  async getCurrencyRate(fromCurrencyCode: string, toCurrencyCode: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${apiUrl}/latest.json?app_id=${API_KEY}&base=${fromCurrencyCode}&symbols=${toCurrencyCode}`,
        ),
      );

      if (!data.rates || !data.rates[toCurrencyCode]) {
        this.logger.error(
          `Failed to get rate for ${fromCurrencyCode}/${toCurrencyCode}`,
        );
      }

      return data.rates[toCurrencyCode];
    } catch (error) {
      this.logger.error(
        `Rate fetch failed: ${fromCurrencyCode}/${toCurrencyCode}`,
        (error as Error).message,
      );
      // throw new Error('Failed to fetch currency rate');
    }
  }

  async getAllSubscribedCurrencyPairs(): Promise<CurrencyPair[]> {
    try {
      const pairs = await this.prisma.currencyPair.findMany({
        where: {
          users: {
            some: { isEnabled: true },
          },
        },
        // include: {
        //   fromCurrency: true,
        //   toCurrency: true,
        // },
      });
      console.log(pairs, 'PAIRS');
      return pairs;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to fetch subscribed currency pairs');
    }
  }
}
