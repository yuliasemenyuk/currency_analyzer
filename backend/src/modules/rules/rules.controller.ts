import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  // Query,
  Get,
  Delete,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import {
  CreateRuleRequestSchema,
  RuleToggleRequestSchema,
  CreateRuleServiceSchema,
  RuleToggleServiceSchema,
  RuleArchiveServiceSchema,
  // ActiveRule,
  RuleListResponse,
  // RuleListResponse,
} from './rules.schema';
import {
  MaxRulesReachedError,
  SameCurrencyRuleError,
  RuleSubscriptionError,
  RuleNotFoundError,
  RuleAlreadySubscribedError,
} from './rules.errors';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { Rule } from '@prisma/client';
// import { z } from 'zod';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsersRules(
    @User() user: { id: string },
  ): Promise<RuleListResponse[]> {
    try {
      console.log('rules', await this.rulesService.getAllUsersRules(user.id));
      return await this.rulesService.getAllUsersRules(user.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch rules');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addRule(
    @User() user: { id: string },
    @Body() body: unknown,
  ): Promise<Rule> {
    const validated = CreateRuleRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors[0].message);
    }

    const serviceData = CreateRuleServiceSchema.parse({
      ...validated.data,
      userId: user.id,
    });

    try {
      return await this.rulesService.handleUserRuleCreation(serviceData);
    } catch (error) {
      if (
        error instanceof MaxRulesReachedError ||
        error instanceof SameCurrencyRuleError ||
        error instanceof RuleAlreadySubscribedError
      ) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to add rule');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':ruleId/toggle')
  async toggleSubscription(
    @User() user: { id: string },
    @Param('ruleId') ruleId: string,
    @Body() body: unknown,
  ): Promise<{ message: string }> {
    const validated = RuleToggleRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    const serviceData = RuleToggleServiceSchema.parse({
      ...validated.data,
      userId: user.id,
      ruleId,
    });

    try {
      await this.rulesService.handleRuleSubscription(serviceData);
      return { message: 'Subscription status changed successfully' };
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

  @UseGuards(JwtAuthGuard)
  @Delete(':ruleId')
  async removeRule(
    @User() user,
    @Param('ruleId') ruleId: string,
  ): Promise<{ message: string }> {
    const serviceData = RuleArchiveServiceSchema.safeParse({
      userId: user.id,
      ruleId,
    });

    if (!serviceData.success) {
      throw new BadRequestException('Invalid rule data');
    }

    try {
      await this.rulesService.removeRule(serviceData.data);
      return { message: 'Rule archived successfully' };
    } catch (error) {
      if (error instanceof RuleNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to archive rule');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':ruleId/restore')
  async restoreRule(
    @User() user: { id: string },
    @Param('ruleId') ruleId: string,
  ): Promise<{ message: string }> {
    const serviceData = RuleArchiveServiceSchema.safeParse({
      userId: user.id,
      ruleId,
    });

    if (!serviceData.success) {
      throw new BadRequestException('Invalid rule or user data');
    }

    try {
      await this.rulesService.restoreRule(serviceData.data);
      return { message: 'Rule restored successfully' };
    } catch (error) {
      if (error instanceof RuleNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof MaxRulesReachedError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to restore rule');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('archived')
  async getArchivedRules(
    @User() user: { id: string },
  ): Promise<RuleListResponse[]> {
    try {
      return await this.rulesService.getArchivedRules(user.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch archived rules');
    }
  }
}
