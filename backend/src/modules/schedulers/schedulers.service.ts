import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';
import { CurrenciesService } from '../currencies/currencies.service';
import { RulesService } from '../rules/rules.service';
import { EmailService } from '../email/email.service';
import Redis from 'ioredis';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private redis = new Redis(6379, process.env.REDIS_HOST);

  constructor(
    private readonly emailService: EmailService,
    private readonly currenciesService: CurrenciesService,
    private readonly RulesService: RulesService,
    private prisma: PrismaService,
    // @InjectMetric('scheduler_cron_executions_total')
    // private readonly cronExecutionsCounter: Counter<string>,
    // @InjectMetric('scheduler_active_rules')
    // private readonly activeRulesGauge: Gauge<string>,
    @InjectMetric('currency_rate_changes')
    private readonly rateChangesGauge: Gauge<string>,
    @InjectMetric('satisfied_rules_total')
    private readonly satisfiedRulesCounter: Counter<string>,
    @InjectMetric('notification_emails_sent_total')
    private readonly emailsSentCounter: Counter<string>,
  ) {}

  @Cron('*/15 * * * * *')
  async handleCron() {
    console.log('Cron job running every 15 seconds');
    await this.fetchSubscribedCurrencyPairs();
    await this.checkActiveRules();
  }

  private async fetchSubscribedCurrencyPairs() {
    try {
      const subscribedPairs =
        await this.currenciesService.getAllSubscribedCurrencyPairs();

      subscribedPairs.forEach((pair) => {
        this.logger.log(`Subscribed pair: ${pair.fromCode}/${pair.toCode}`);
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch subscribed currency pairs: ${(error as Error).message}`,
      );
    }
  }

  private async checkActiveRules() {
    try {
      const activeRules = await this.RulesService.getAllActiveRules();
      console.log(activeRules, 'active rules');

      for (const rule of activeRules) {
        console.log('rule', rule);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const rate = await this.currenciesService.getCurrencyRate(
          rule.currencyPair.fromCode,
          rule.currencyPair.toCode,
        );

        await this.prisma.currencyRateHistory.create({
          data: {
            currencyPair: { connect: { id: rule.pairId } },
            rate,
          },
        });

        this.rateChangesGauge.set(
          {
            pair: `${rule.currencyPair.fromCode}/${rule.currencyPair.toCode}`,
          },
          rate,
        );

        const previousRate = await this.getPreviousRate(
          rule.pairId,
          rule.currencyPair.fromCode,
          rule.currencyPair.toCode,
        );

        for (const userOnRule of rule.users) {
          const isSatisfied = await this.checkRuleSatisfaction(
            rate,
            previousRate,
            rule.percentage,
            rule.trendDirection,
            rule.pairId,
          );

          console.log(
            rate,
            `${rule.currencyPair.fromCode}/${rule.currencyPair.toCode}, ${userOnRule.user.email}`,
          );
          console.log('isSatisfied', isSatisfied);
          if (isSatisfied) {
            this.satisfiedRulesCounter.inc({
              pair: `${rule.currencyPair.fromCode}/${rule.currencyPair.toCode}`,
              direction: rule.trendDirection,
            });
            //Email sending logic
            const emailSent = await this.emailService.sendRuleNotification(
              userOnRule.user.email,
              rule.currencyPair.fromCode,
              rule.currencyPair.toCode,
              rate,
              rule.percentage,
              rule.trendDirection,
            );
            if (emailSent) {
              this.emailsSentCounter.inc();
            }
          }
        }
      }
      //   try {
      //     const cacheKey = `currency_rate_${rule.currencyPair.fromCode}_${rule.currencyPair.toCode}`;

      //     try {
      //       const cachedRate = await this.redis.get(cacheKey);
      //       const rate = await this.currenciesService.getCurrencyRate(
      //         rule.currencyPair.fromCode,
      //         rule.currencyPair.toCode,
      //       );

      //       if (cachedRate && rate.toString() === cachedRate) {
      //         this.logger.log(
      //           `Using cached rate for ${cacheKey}: ${cachedRate}`,
      //         );
      //       } else {
      //         await this.redis.set(cacheKey, rate.toString(), 'EX', 600);
      //         this.logger.log(`Fetched new rate for ${cacheKey}: ${rate}`);
      //       }

      //       await this.prisma.currencyRateHistory.create({
      //         data: {
      //           currencyPair: { connect: { id: rule.pairId } },
      //           rate,
      //         },
      //       });

      //       for (const userOnRule of rule.users) {
      //         try {
      //           const isSatisfied = await this.checkRuleSatisfaction(
      //             rate,
      //             rule.percentage,
      //             rule.trendDirection,
      //             rule.pairId,
      //           );
      //           this.logger.log(
      //             `Currency pair: ${rule.currencyPair.fromCode} to ${rule.currencyPair.toCode}, Rate: ${rate}, Subscribed User: ${userOnRule.user.email}, Rule satisfied: ${isSatisfied}`,
      //           );
      //           if (isSatisfied) {
      //             // Email
      //           }
      //         } catch (error) {
      //           this.logger.error(
      //             `Failed to check rule satisfaction: ${(error as Error).message}`,
      //           );
      //           continue;
      //         }
      //       }
      //     } catch (error) {
      //       this.logger.error(
      //         `Failed to process rate for ${cacheKey}: ${(error as Error).message}`,
      //       );
      //       continue;
      //     }
      //   } catch (error) {
      //     this.logger.error(
      //       `Failed to process rule ${rule.id}: ${(error as Error).message}`,
      //     );
      //     continue;
      //   }
      // }
    } catch (error) {
      this.logger.error(
        `Failed to fetch active rules: ${(error as Error).message}`,
      );
    }
  }

  // private const cacheCurrentRate {
  //   const cacheKey = `currency_rate_${rule.currencyPair.fromCode}_${rule.currencyPair.toCode}`;
  //   console.log('cacheKey', cacheKey);
  // };

  private async checkRuleSatisfaction(
    currentRate: number,
    previousRate: number,
    percentage: number,
    trendDirection: string,
    pairId: string,
  ): Promise<boolean> {
    try {
      // const previousRate = await this.getPreviousRate(pairId);
      if (!previousRate) {
        this.logger.warn(`No previous rate found for pair ${pairId}`);
        return false;
      }

      this.logger.debug('Rate comparison:', {
        currentRate,
        previousRate,
        trendDirection,
        percentage,
      });

      const percentageChange = Math.round(
        ((currentRate - previousRate) / previousRate) * 100,
      );

      this.logger.debug('Change calculation:', {
        percentageChange,
        targetPercentage: percentage,
        direction: trendDirection,
      });

      return trendDirection === 'increase'
        ? percentageChange >= percentage
        : percentageChange <= -percentage;
    } catch (error) {
      this.logger.error(
        `Failed to check rule satisfaction for pair ${pairId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async getPreviousRate(
    pairId: string,
    fromCode: string,
    toCode: string,
  ): Promise<number | null> {
    try {
      const cachedRate = await this.getPreviousRateFromCache(fromCode, toCode);

      if (cachedRate !== null) {
        this.logger.debug('Retrieved previous rate from cache:', cachedRate);
        return cachedRate;
      }

      const databaseRate = await this.getPreviousRateFromDatabase(pairId);

      if (databaseRate !== null) {
        // await this.cacheCurrentRate(fromCode, toCode, databaseRate);
        this.logger.debug(
          'Retrieved previous rate from database and cached:',
          databaseRate,
        );
        return databaseRate;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get previous rate: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  private async getPreviousRateFromCache(
    fromCode: string,
    toCode: string,
  ): Promise<number | null> {
    const cacheKey = `previous_rate:${fromCode}:${toCode}`;
    const cachedRate = await this.redis.get(cacheKey);
    return cachedRate ? parseFloat(cachedRate) : null;
  }

  private async getPreviousRateFromDatabase(
    pairId: string,
  ): Promise<number | null> {
    try {
      const previousRateRecord =
        await this.prisma.currencyRateHistory.findFirst({
          where: { pairId },
          orderBy: { timestamp: 'desc' },
          skip: 1,
        });

      this.logger.debug(
        'Previous rate record from database:',
        previousRateRecord,
      );
      return previousRateRecord?.rate ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to get rate from database: ${(error as Error).message}`,
      );
      return null;
    }
  }

  // async getPreviousRate(pairId: string): Promise<number | null> {
  //   try {
  //     const previousRateRecord =
  //       await this.prisma.currencyRateHistory.findFirst({
  //         where: { pairId },
  //         orderBy: { timestamp: 'desc' },
  //         skip: 1,
  //       });

  //     this.logger.debug('Previous rate record:', previousRateRecord);
  //     return previousRateRecord?.rate ?? null;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to get previous rate for pair ${pairId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
  //     );
  //   }
  // }
}
