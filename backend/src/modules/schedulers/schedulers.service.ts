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
  }

  private async fetchSubscribedCurrencyPairs() {
    try {
      const subscribedPairs =
        await this.currenciesService.getAllSubscribedCurrencyPairs();
      for (const pair of subscribedPairs) {
        const rate = await this.currenciesService.getCurrencyRate(
          pair.fromCode,
          pair.toCode,
        );

        this.rateChangesGauge.set(
          {
            pair: `${pair.fromCode}/${pair.toCode}`,
          },
          rate,
        );

        await this.prisma.currencyRateHistory.create({
          data: {
            currencyPair: { connect: { id: pair.id } },
            rate,
          },
        });

        const previousRate = await this.getPreviousRate(
          pair.id,
          pair.fromCode,
          pair.toCode,
        );

        if (previousRate !== rate) {
          await this.cacheCurrentRate(pair.fromCode, pair.toCode, rate);
        }

        const activeRules = await this.RulesService.getAllActiveRules();
        const ruleToCheck = activeRules.find(
          (rule) => rule.currencyPair.id === pair.id,
        );
        if (ruleToCheck) {
          for (const userOnRule of ruleToCheck.users) {
            const isSatisfied = await this.checkRuleSatisfaction(
              rate,
              previousRate,
              ruleToCheck.percentage,
              ruleToCheck.trendDirection,
              ruleToCheck.pairId,
            );

            if (isSatisfied) {
              this.satisfiedRulesCounter.inc({
                pair: `${ruleToCheck.currencyPair.fromCode}/${ruleToCheck.currencyPair.toCode}`,
                direction: ruleToCheck.trendDirection,
              });
              //Email sending logic
              const emailSent = await this.emailService.sendRuleNotification(
                userOnRule.user.email,
                ruleToCheck.currencyPair.fromCode,
                ruleToCheck.currencyPair.toCode,
                rate,
                ruleToCheck.percentage,
                ruleToCheck.trendDirection,
              );
              if (emailSent) {
                this.emailsSentCounter.inc();
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch subscribed currency pairs and rules: ${(error as Error).message}`,
      );
    }
  }

  private async checkRuleSatisfaction(
    currentRate: number,
    previousRate: number | null,
    percentage: number,
    trendDirection: string,
    pairId: string,
  ): Promise<boolean> {
    try {
      if (!previousRate) {
        this.logger.warn(`No previous rate found for pair ${pairId}`);
        return false;
      }

      this.logger
        .debug(`Rate comparison: rule: ${currentRate}, previous rate: ${previousRate}, 
        trend direction: ${trendDirection}, percentage: ${percentage}`);

      const percentageChange = Math.round(
        ((currentRate - previousRate) / previousRate) * 100,
      );

      this.logger
        .debug(`Change calculation: persecentageChange: ${percentageChange}, 
        targetPercentage: ${percentage}, direction: ${trendDirection}
      `);

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
        await this.cacheCurrentRate(fromCode, toCode, databaseRate);
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
    const cacheKey = `currency_rate_${fromCode}_${toCode}`;
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

      if (previousRateRecord) {
        this.logger.debug(
          'Previous rate record from database:',
          previousRateRecord.rate,
        );
      }
      return previousRateRecord?.rate ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to get rate from database: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async cacheCurrentRate(
    fromCode: string,
    toCode: string,
    rate: number,
  ) {
    const cacheKey = `currency_rate_${fromCode}_${toCode}`;
    await this.redis.set(cacheKey, rate.toString(), 'EX', 60);
    this.logger.log(`Cached current rate for ${cacheKey}: ${rate}`);
  }
}
