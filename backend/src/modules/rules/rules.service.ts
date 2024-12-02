import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddRuleDto } from './rules.schema';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async createRule(data: AddRuleDto) {
    return this.prisma.rule.create({
      data: {
        currencyPair: { connect: { id: data.pairId } },
        percentage: data.percentage,
        trendDirection: data.trendDirection,
        isEnabled: true,
      },
    });
  }

  async subscribeUserToRule(userId: string, ruleId: string) {
    return this.prisma.usersOnRules.create({
      data: {
        user: { connect: { id: userId } },
        rule: { connect: { id: ruleId } },
      },
    });
  }
}
