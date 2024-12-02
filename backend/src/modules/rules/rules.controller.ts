import { Controller, Post, Body } from '@nestjs/common';
import { RulesService } from './rules.service';
import { AddRuleDto } from './rules.schema';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  async addRule(@Body() body: AddRuleDto) {
    const { userId, ...ruleData } = body;
    const newRule = await this.rulesService.createRule(ruleData);
    await this.rulesService.subscribeUserToRule(userId, newRule.id);
    return newRule;
  }
}
