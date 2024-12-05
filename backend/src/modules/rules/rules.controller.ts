import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import {
  AddRuleWithCurrencyCodesSchema,
  AddRuleWithCurrencyCodesDto,
} from './rules.schema';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  async getUsersRules(@Query('userId') userId: string) {
    return this.rulesService.getAllUsersRules(userId);
  }

  @Post()
  async addRule(@Body() body: AddRuleWithCurrencyCodesDto) {
    const parsedBody = AddRuleWithCurrencyCodesSchema.safeParse(body);
    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.errors);
    }
    return this.rulesService.handleUserRuleSubscription(parsedBody.data);
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
