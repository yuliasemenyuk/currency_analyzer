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
    const activeRules = await this.RulesService.getActiveRules();

    for (const rule of activeRules) {
      const cacheKey = `currency_rate_${rule.currencyPair.fromCode}_${rule.currencyPair.toCode}`;
      const cachedRate = await this.redis.get(cacheKey);

      const rate = await this.currenciesService.getCurrencyRate(
        rule.currencyPair.fromCode,
        rule.currencyPair.toCode,
      );

      if (cachedRate && rate.toString() === cachedRate) {
        this.logger.log(`Using cached rate for ${cacheKey}: ${cachedRate}`);
      } else {
        await this.redis.set(cacheKey, rate.toString(), 'EX', 600); // 10 minutes

        await this.prisma.currencyRateHistory.create({
          data: {
            currencyPair: { connect: { id: rule.pairId } },
            rate,
          },
        });

        this.logger.log(`Fetched new rate for ${cacheKey}: ${rate}`);

        rule.users.forEach((userOnRule) => {
          const email = userOnRule.user.email;
          this.logger.log(
            `Currency pair: ${rule.currencyPair.fromCode} to ${rule.currencyPair.toCode}, Rate: ${rate}, Subscribed User: ${email}`,
          );
        });
      }
    }
  }
}
