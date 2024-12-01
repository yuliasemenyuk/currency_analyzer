import { Injectable } from '@nestjs/common';
import { Currency, CurrencySchema } from './currencies.schema';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  private readonly currencies: Currency[] = [];
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Currency[]> {
    const currencies = await this.prisma.currency.findMany();
    return currencies.map((c) => CurrencySchema.parse(c));
  }
}
