import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrenciesService } from '../currencies/currencies.service';
import { RulesService } from '../rules/rules.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly currenciesService: CurrenciesService,
    private readonly RulesService: RulesService,
  ) {}

  @Cron('*/15 * * * * *')
  async handleCron() {
    this.logger.log('Fetching active currency rates...');
    await this.fetchActiveCurrencyRates();
  }

  private async fetchActiveCurrencyRates() {
    const activeRules = await this.RulesService.getActiveRules();
    console.log(activeRules, 'activeRules');

    for (const rule of activeRules) {
      const rate = await this.currenciesService.getCurrencyRate(
        rule.currencyPair.fromCode,
        rule.currencyPair.toCode,
      );

      rule.users.forEach((userOnRule) => {
        const email = userOnRule.user.email;
        this.logger.log(
          `Currency pair: ${rule.currencyPair.fromCode} to ${rule.currencyPair.toCode}, Rate: ${rate}, Subscribed User: ${email}`,
        );
      });
    }
  }
}
