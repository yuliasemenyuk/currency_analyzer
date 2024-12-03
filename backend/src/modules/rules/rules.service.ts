import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ActiveRuleSchema, AddRuleWithCurrencyIdsDto } from './rules.schema';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async findRuleByCurrencies(data: AddRuleWithCurrencyIdsDto) {
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

  async createRule(data: AddRuleWithCurrencyIdsDto) {
    console.log('createRule');
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

    return this.prisma.rule.create({
      data: {
        currencyPair: { connect: { id: pair.id } },
        percentage,
        trendDirection,
        isEnabled: true,
      },
    });
  }

  async handleUserRuleSubscription(data: AddRuleWithCurrencyIdsDto) {
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

  //TODO: Decide on validation type later
  async getActiveRules() {
    const activeRules = await this.prisma.rule.findMany({
      where: { isEnabled: true },
      include: {
        users: { include: { user: true } },
        currencyPair: true,
      },
    });
    // return activeRules;
    return activeRules.map((rule) => ActiveRuleSchema.parse(rule));
  }
}
