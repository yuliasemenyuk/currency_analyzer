import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ActiveRuleSchema, AddRuleWithCurrencyCodesDto } from './rules.schema';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async getAllUsersRules(userId: string) {
    const userRules = await this.prisma.rule.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        currencyPair: true,
        users: {
          where: { userId },
          select: { isEnabled: true },
        },
      },
    });

    return userRules.map((rule) => ({
      ...rule,
      isEnabled: rule.users[0]?.isEnabled ?? false,
    }));
  }

  async findRuleByCurrencies(data: AddRuleWithCurrencyCodesDto) {
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
      throw new BadRequestException('Currency pair does not exist.');
    }

    return this.prisma.rule.findFirst({
      where: {
        currencyPair: {
          id: pair.id,
        },
        percentage,
        trendDirection,
        isEnabled: true,
      },
    });
  }

  async createRule(data: AddRuleWithCurrencyCodesDto) {
    console.log('createRule');
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
      throw new BadRequestException('Currency pair does not exist.');
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
  }

  async handleUserRuleSubscription(data: AddRuleWithCurrencyCodesDto) {
    console.log('handleUserRuleSubscription');
    const {
      userId,
      fromCurrencyCode,
      toCurrencyCode,
      percentage,
      trendDirection,
    } = data;

    if (fromCurrencyCode === toCurrencyCode) {
      throw new BadRequestException('Cannot subscribe to the same currency.');
    }

    const existingRule = await this.findRuleByCurrencies({
      fromCurrencyCode,
      toCurrencyCode,
      percentage,
      trendDirection,
    });

    console.log('existingRule', existingRule);

    let newRule;
    if (existingRule) {
      await this.subscribeUserToRule(userId, existingRule.id, true);
      newRule = existingRule;
    } else {
      newRule = await this.createRule({
        userId,
        fromCurrencyCode,
        toCurrencyCode,
        percentage,
        trendDirection,
      });
      await this.subscribeUserToRule(userId, newRule.id, true);
    }

    return newRule;
  }

  async subscribeUserToRule(
    userId: string,
    ruleId: string,
    isEnabled: boolean,
  ) {
    return this.prisma.usersOnRules.upsert({
      where: {
        userId_ruleId: { userId, ruleId },
      },
      update: {
        isEnabled,
      },
      create: {
        user: { connect: { id: userId } },
        rule: { connect: { id: ruleId } },
        isEnabled,
      },
    });
  }

  async getAllActiveRules() {
    const activeRules = await this.prisma.rule.findMany({
      where: { isEnabled: true },
      include: {
        users: { include: { user: true } },
        currencyPair: true,
      },
    });
    return activeRules.map((rule) => ActiveRuleSchema.parse(rule));
  }
}
