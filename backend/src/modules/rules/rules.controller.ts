import { Controller, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { RulesService } from './rules.service';
import { AddRuleWithCurrencyCodesDto } from './rules.schema';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  async addRule(@Body() body: AddRuleWithCurrencyCodesDto) {
    return this.rulesService.handleUserRuleSubscription(body);
  }

  @Patch(':ruleId/unsubscribe')
  async unsubscribeUser(
    @Param('ruleId') ruleId: string,
    @Query('userId') userId: string,
  ) {
    await this.rulesService.subscribeUserToRule(userId, ruleId, false);
    return { message: 'Unsubscribed successfully' };
  }
}
