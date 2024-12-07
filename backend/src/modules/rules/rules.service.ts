import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ActiveRuleSchema, AddRuleWithCurrencyCodesDto } from './rules.schema';
import {
  InvalidRuleDataError,
  MaxRulesReachedError,
  RuleNotFoundError,
  RuleSubscriptionError,
  SameCurrencyRuleError,
  PairNotFoundError,
} from './rules.errors';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async getAllUsersRules(userId: string) {
    try {
      const userRules = await this.prisma.rule.findMany({
        where: {
          users: { some: { userId } },
        },
        include: {
          currencyPair: true,
          users: {
            where: { userId },
            select: { isEnabled: true },
          },
        },
      });

      if (!userRules.length) {
        throw new RuleNotFoundError('No rules found for user');
      }

      return userRules.map((rule) => ({
        ...rule,
        isEnabled: rule.users[0]?.isEnabled ?? false,
      }));
    } catch (error) {
      if (error instanceof RuleNotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch user rules');
    }
  }

  async findRuleByCurrencies(data: AddRuleWithCurrencyCodesDto) {
    try {
      const { fromCurrencyCode, toCurrencyCode, percentage, trendDirection } =
        data;

      const pair = await this.prisma.currencyPair.findUnique({
        where: {
          fromCode_toCode: {
            fromCode: fromCurrencyCode,
            toCode: toCurrencyCode,
          },
        },
      });

      if (!pair) {
        throw new PairNotFoundError(`${fromCurrencyCode}/${toCurrencyCode}`);
      }

      return this.prisma.rule.findFirst({
        where: {
          currencyPair: { id: pair.id },
          percentage,
          trendDirection,
          isEnabled: true,
        },
      });
    } catch (error) {
      if (error instanceof PairNotFoundError) {
        throw error;
      }
      throw new Error('Failed to find rule');
    }
  }

  async createRule(data: AddRuleWithCurrencyCodesDto) {
    try {
      const {
        userId,
        fromCurrencyCode,
        toCurrencyCode,
        percentage,
        trendDirection,
      } = data;

      const pair = await this.prisma.currencyPair.findUnique({
        where: {
          fromCode_toCode: {
            fromCode: fromCurrencyCode,
            toCode: toCurrencyCode,
          },
        },
      });

      if (!pair) {
        throw new PairNotFoundError(`${fromCurrencyCode}/${toCurrencyCode}`);
      }

      const existingRulesCount = await this.prisma.rule.count({
        where: {
          users: { some: { userId } },
          trendDirection,
        },
      });

      if (existingRulesCount >= 5) {
        throw new MaxRulesReachedError(userId, trendDirection);
      }

      const rule = await this.prisma.rule.create({
        data: {
          currencyPair: { connect: { id: pair.id } },
          percentage,
          trendDirection,
          isEnabled: true,
        },
      });

      await this.prisma.usersOnRules.create({
        data: {
          user: { connect: { id: userId } },
          rule: { connect: { id: rule.id } },
          isEnabled: true,
        },
      });

      return rule;
    } catch (error) {
      if (
        error instanceof PairNotFoundError ||
        error instanceof MaxRulesReachedError
      ) {
        throw error;
      }
      throw new Error('Failed to create rule');
    }
  }

  async handleUserRuleCreation(data: AddRuleWithCurrencyCodesDto) {
    try {
      const {
        userId,
        fromCurrencyCode,
        toCurrencyCode,
        percentage,
        trendDirection,
      } = data;

      if (fromCurrencyCode === toCurrencyCode) {
        throw new SameCurrencyRuleError(fromCurrencyCode);
      }

      const existingRule = await this.findRuleByCurrencies({
        fromCurrencyCode,
        toCurrencyCode,
        percentage,
        trendDirection,
      });

      let newRule;
      if (existingRule) {
        await this.handleRuleSubscription(userId, existingRule.id, true);
        newRule = existingRule;
      } else {
        newRule = await this.createRule(data);
        await this.handleRuleSubscription(userId, newRule.id, true);
      }

      return newRule;
    } catch (error) {
      if (
        error instanceof SameCurrencyRuleError ||
        error instanceof PairNotFoundError ||
        error instanceof MaxRulesReachedError
      ) {
        throw error;
      }
      throw new Error('Failed to handle rule subscription');
    }
  }

  async handleRuleSubscription(
    userId: string,
    ruleId: string,
    isEnabled: boolean,
  ) {
    try {
      return await this.prisma.usersOnRules.upsert({
        where: {
          userId_ruleId: { userId, ruleId },
        },
        update: { isEnabled },
        create: {
          user: { connect: { id: userId } },
          rule: { connect: { id: ruleId } },
          isEnabled,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new RuleSubscriptionError(userId, ruleId);
    }
  }

  async getAllActiveRules() {
    try {
      const activeRules = await this.prisma.rule.findMany({
        where: { isEnabled: true },
        include: {
          users: { include: { user: true } },
          currencyPair: true,
        },
      });

      return activeRules.map((rule) => {
        try {
          return ActiveRuleSchema.parse(rule);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          throw new InvalidRuleDataError();
        }
      });
    } catch (error) {
      if (error instanceof InvalidRuleDataError) {
        throw error;
      }
      throw new Error('Failed to fetch active rules');
    }
  }
}
