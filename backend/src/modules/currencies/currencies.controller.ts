import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency, RateQuerySchema } from './currencies.schema';
import { z } from 'zod';
import { CurrencyPair } from '@prisma/client';

@Controller('currencies')
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}

  @Get()
  async getAllCurrencies(): Promise<Currency[]> {
    return this.currenciesService.findAll();
  }

  @Get('monitored')
  async getMonitoredCurrencies(
    @Query('userId') userId: string,
  ): Promise<CurrencyPair[]> {
    return this.currenciesService.getMonitoredPairs(userId);
  }

  @Post('monitor')
  async startMonitoringCurrencies(
    @Body() body: { userId: string; fromCode: string; toCode: string },
  ) {
    return this.currenciesService.startMonitoringPair(body);
  }

  @Get('rates')
  async getRates(@Query() query: z.infer<typeof RateQuerySchema>) {
    const validated = RateQuerySchema.parse(query);
    if (validated.from === validated.to) {
      throw new BadRequestException('From and to currencies must be different');
    }
    return this.currenciesService.getRates(validated.from, validated.to);
  }

  @Get(':id')
  findById(@Param('id') id: string): string {
    return `This action returns a currency based on id - ${id}`;
  }

  // @Get()
  // async findAll(): Promise<any[]> {
  //   return [];
  // }

  // export class CreateCatDto endpoints should i{
  //     name: string;
  //     age: number;
  //     breed: string;
  //   }

  //   @Post()
  //   async create(@Body() createCatDto: CreateCatDto) {
  //     return 'This action adds a new cat';
  //   }
}
