import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Get,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { AddRuleWithCurrencyCodesSchema } from './rules.schema';
import {
  MaxRulesReachedError,
  SameCurrencyRuleError,
  RuleSubscriptionError,
  RuleNotFoundError,
} from './rules.errors';
import { z } from 'zod';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  async getUsersRules(@Query('userId') userId: unknown) {
    const validated = z.string().uuid().safeParse(userId);
    if (!validated.success) {
      throw new BadRequestException('Invalid user id format');
    }

    try {
      return await this.rulesService.getAllUsersRules(validated.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch rules');
    }
  }

  @Post()
  async addRule(@Body() body: unknown) {
    const validated = AddRuleWithCurrencyCodesSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    try {
      return await this.rulesService.handleUserRuleCreation(validated.data);
    } catch (error) {
      if (error instanceof MaxRulesReachedError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof SameCurrencyRuleError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to add rule');
    }
  }

  @Patch(':ruleId/toggle')
  async toggleSubscription(
    @Param('ruleId') ruleId: string,
    @Query('userId') userId: string,
  ) {
    const validatedRuleId = z.string().uuid().safeParse(ruleId);
    const validatedUserId = z.string().uuid().safeParse(userId);

    if (!validatedRuleId.success || !validatedUserId.success) {
      throw new BadRequestException('Invalid rule id or user id format');
    }

    try {
      await this.rulesService.handleRuleSubscription(
        validatedUserId.data,
        validatedRuleId.data,
        false,
      );
      return { message: 'Subscription status changed succesfullly' };
    } catch (error) {
      if (error instanceof RuleSubscriptionError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof RuleNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to change subscription status',
      );
    }
  }
}
