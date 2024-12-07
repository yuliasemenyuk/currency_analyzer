import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrenciesService } from '../currencies/currencies.service';
import { RulesService } from '../rules/rules.service';
import Redis from 'ioredis';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private redis = new Redis();

  constructor(
    private readonly currenciesService: CurrenciesService,
    private readonly RulesService: RulesService,
    private prisma: PrismaService,
  ) {}

  @Cron('*/15 * * * * *')
  async handleCron() {
    await this.fetchActiveCurrencyRates();
  }

  private async fetchActiveCurrencyRates() {
    try {
      const activeRules = await this.RulesService.getAllActiveRules();

      for (const rule of activeRules) {
        try {
          const cacheKey = `currency_rate_${rule.currencyPair.fromCode}_${rule.currencyPair.toCode}`;

          try {
            const cachedRate = await this.redis.get(cacheKey);
            const rate = await this.currenciesService.getCurrencyRate(
              rule.currencyPair.fromCode,
              rule.currencyPair.toCode,
            );

            if (cachedRate && rate.toString() === cachedRate) {
              this.logger.log(
                `Using cached rate for ${cacheKey}: ${cachedRate}`,
              );
            } else {
              await this.redis.set(cacheKey, rate.toString(), 'EX', 600);
              this.logger.log(`Fetched new rate for ${cacheKey}: ${rate}`);
            }

            await this.prisma.currencyRateHistory.create({
              data: {
                currencyPair: { connect: { id: rule.pairId } },
                rate,
              },
            });

            for (const userOnRule of rule.users) {
              try {
                const isSatisfied = await this.checkRuleSatisfaction(
                  rate,
                  rule.percentage,
                  rule.trendDirection,
                  rule.pairId,
                );

                this.logger.log(
                  `Currency pair: ${rule.currencyPair.fromCode} to ${rule.currencyPair.toCode}, Rate: ${rate}, Subscribed User: ${userOnRule.user.email}, Rule satisfied: ${isSatisfied}`,
                );
              } catch (error) {
                this.logger.error(
                  `Failed to check rule satisfaction: ${(error as Error).message}`,
                );
                continue;
              }
            }
          } catch (error) {
            this.logger.error(
              `Failed to process rate for ${cacheKey}: ${(error as Error).message}`,
            );
            continue;
          }
        } catch (error) {
          this.logger.error(
            `Failed to process rule ${rule.id}: ${(error as Error).message}`,
          );
          continue;
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch active rules: ${(error as Error).message}`,
      );
    }
  }

  private async checkRuleSatisfaction(
    currentRate: number,
    percentage: number,
    trendDirection: string,
    pairId: string,
  ): Promise<boolean> {
    try {
      const previousRate = await this.getPreviousRate(pairId);
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

  async getPreviousRate(pairId: string): Promise<number | null> {
    try {
      const previousRateRecord =
        await this.prisma.currencyRateHistory.findFirst({
          where: { pairId },
          orderBy: { timestamp: 'desc' },
          skip: 1,
        });

      this.logger.debug('Previous rate record:', previousRateRecord);
      return previousRateRecord?.rate ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to get previous rate for pair ${pairId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
