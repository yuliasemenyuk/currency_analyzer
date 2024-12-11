import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  ActiveRuleSchema,
  AddRuleWithCurrencyCodesDto,
  CreateRuleServiceDto,
  RuleToggleServiceDto,
  RuleArchiveServiceDto,
  // ActiveRule,
  RuleListResponse,
} from './rules.schema';
import {
  InvalidRuleDataError,
  MaxRulesReachedError,
  RuleNotFoundError,
  RuleSubscriptionError,
  SameCurrencyRuleError,
  PairNotFoundError,
  RuleAlreadySubscribedError,
} from './rules.errors';
import { Rule } from '@prisma/client';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async getAllUsersRules(userId: string): Promise<RuleListResponse[]> {
    try {
      const userRules = await this.prisma.rule.findMany({
        where: {
          users: {
            some: {
              userId,
              isArchived: false,
            },
          },
        },
        include: {
          currencyPair: true,
          users: {
            where: { userId },
          },
        },
      });

      return userRules.map(({ users, ...rest }) => ({
        ...rest,
        isEnabled: users[0]?.isEnabled ?? false,
      }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw error;
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

      return this.prisma.rule.findFirst({
        where: {
          currencyPair: { id: pair.id },
          percentage,
          trendDirection,
          isEnabled: true,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new RuleNotFoundError('Failed to find rule');
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
      // if (
      //   error instanceof PairNotFoundError ||
      //   error instanceof MaxRulesReachedError
      // ) {
      throw error;
      // }
      // throw new Error('Failed to create rule');
    }
  }

  async handleUserRuleCreation(data: CreateRuleServiceDto): Promise<Rule> {
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

      const existingRulesCount = await this.prisma.rule.count({
        where: {
          users: { some: { userId, isArchived: false } },
          trendDirection,
        },
      });

      if (existingRulesCount >= 5) {
        throw new MaxRulesReachedError(trendDirection);
      }

      const existingRule = await this.findRuleByCurrencies({
        fromCurrencyCode,
        toCurrencyCode,
        percentage,
        trendDirection,
      });

      if (existingRule) {
        const existingSubscription = await this.prisma.usersOnRules.findUnique({
          where: {
            isArchived: false,
            userId_ruleId: {
              userId,
              ruleId: existingRule.id,
            },
          },
        });

        if (existingSubscription) {
          throw new RuleAlreadySubscribedError();
        }

        const archivedRule = await this.prisma.usersOnRules.findUnique({
          where: {
            isArchived: true,
            userId_ruleId: {
              userId,
              ruleId: existingRule.id,
            },
          },
        });

        if (archivedRule) {
          await this.restoreRule({
            userId,
            ruleId: existingRule.id,
          });
          return existingRule;
        }
      }

      let newRule;
      if (existingRule) {
        await this.handleRuleSubscription({
          userId,
          ruleId: existingRule.id,
          isEnabled: true,
        });
        newRule = existingRule;
      } else {
        newRule = await this.createRule(data);
        await this.handleRuleSubscription({
          userId,
          ruleId: newRule.id,
          isEnabled: true,
        });
      }

      return newRule;
    } catch (error) {
      throw error;
      //   if (
      //     error instanceof SameCurrencyRuleError ||
      //     error instanceof PairNotFoundError ||
      //     error instanceof MaxRulesReachedError ||
      //     error instanceof RuleAlreadySubscribedError ||
      //     error instanceof RuleNotFoundError
      //   ) {
      //     throw error;
      //   }
      //   throw new Error('Failed to handle rule subscription');
    }
  }

  async handleRuleSubscription(data: RuleToggleServiceDto) {
    const { userId, ruleId, isEnabled } = data;
    try {
      return await this.prisma.usersOnRules.upsert({
        where: {
          userId_ruleId: {
            userId: userId,
            ruleId: ruleId,
          },
        },
        update: {
          isEnabled: data.isEnabled,
        },
        create: {
          user: { connect: { id: userId } },
          rule: { connect: { id: ruleId } },
          isEnabled: isEnabled,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log(error);
      if (error instanceof MaxRulesReachedError) {
        throw error;
      }
      throw new RuleSubscriptionError(data.userId, data.ruleId);
    }
  }

  async removeRule(data: RuleArchiveServiceDto) {
    const { userId, ruleId } = data;
    try {
      await this.prisma.usersOnRules.update({
        where: {
          userId_ruleId: {
            userId: userId,
            ruleId: ruleId,
          },
        },
        data: {
          isArchived: true,
          isEnabled: false,
        },
      });

      // return rule;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // if (error instanceof MaxRulesReachedError) {
      //   throw error;
      // }
      throw error;
    }
  }

  async restoreRule(data: RuleArchiveServiceDto): Promise<void> {
    const { userId, ruleId } = data;
    try {
      const existingRulesCount = await this.prisma.rule.count({
        where: {
          users: { some: { userId, isArchived: false } },
          trendDirection: (
            await this.prisma.rule.findUnique({
              where: { id: ruleId },
              select: { trendDirection: true },
            })
          )?.trendDirection,
        },
      });

      if (existingRulesCount >= 5) {
        throw new MaxRulesReachedError(
          (
            await this.prisma.rule.findUnique({
              where: { id: ruleId },
              select: { trendDirection: true },
            })
          )?.trendDirection,
        );
      }

      await this.prisma.usersOnRules.update({
        where: {
          userId_ruleId: {
            userId,
            ruleId,
          },
        },
        data: { isArchived: false, isEnabled: true },
      });

      // return rule;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllActiveRules() {
    try {
      const activeRules = await this.prisma.rule.findMany({
        where: {
          users: {
            some: {
              isEnabled: true,
              isArchived: false,
            },
          },
        },
        include: {
          users: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
          currencyPair: true,
        },
      });

      return activeRules.map((rule) => {
        try {
          return ActiveRuleSchema.parse(rule);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.log(error);
          throw new InvalidRuleDataError();
        }
      });
    } catch (error) {
      // if (error instanceof InvalidRuleDataError) {
      throw error;
    }
    // throw new Error('Failed to fetch active rules');
    // }
  }

  async getArchivedRules(userId: string): Promise<RuleListResponse[]> {
    try {
      const archivedRules = await this.prisma.rule.findMany({
        where: {
          users: { some: { userId, isArchived: true } },
        },
        include: {
          currencyPair: true,
          users: {
            where: { userId },
            // select: { isEnabled: true },
          },
        },
      });

      return archivedRules.map(({ users, ...rest }) => ({
        ...rest,
        isEnabled: users[0]?.isEnabled ?? false,
      }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw error;
    }
  }
}
