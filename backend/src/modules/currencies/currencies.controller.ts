import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import {
  Currency,
  RateQuerySchema,
  StartMonitoringPairSchema,
  StartMonitoringPairDto,
  ToggleMonitoredPairSchema,
  ToggleMonitoredPairDto,
} from './currencies.schema';
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
  async startMonitoringCurrencies(@Body() body: StartMonitoringPairDto) {
    const parsedBody = StartMonitoringPairSchema.safeParse(body);
    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.errors);
    }
    return this.currenciesService.startMonitoringPair(parsedBody.data);
  }

  @Patch('disable')
  async disableMonitored(@Body() body: ToggleMonitoredPairDto) {
    const parsedBody = ToggleMonitoredPairSchema.safeParse(body);
    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.errors);
    }
    return this.currenciesService.disableMonitoredPair(parsedBody.data);
  }

  @Patch('enable')
  async enableMonitored(@Body() body: unknown) {
    const parsedBody = ToggleMonitoredPairSchema.safeParse(body);
    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.errors);
    }
    return this.currenciesService.enableMonitoredPair(parsedBody.data);
  }

  @Get('rates')
  async getRates(@Query() query: unknown) {
    const validated = RateQuerySchema.safeParse(query);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }
    if (validated.data.from === validated.data.to) {
      throw new BadRequestException('From and to currencies must be different');
    }
    return this.currenciesService.getRates(
      validated.data.from,
      validated.data.to,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): string {
    return `This action returns a currency based on id - ${id}`;
  }
}
