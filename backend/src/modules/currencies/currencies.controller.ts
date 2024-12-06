import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import {
  Currency,
  RateQuerySchema,
  StartMonitoringPairSchema,
  // StartMonitoringPairDto,
  ToggleMonitoredPairSchema,
  // ToggleMonitoredPairDto,
} from './currencies.schema';
import { DuplicatePairError, CurrencyNotFoundError } from './currencies.errors';
import { CurrencyPair } from '@prisma/client';
import z from 'zod';

@Controller('currencies')
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}

  @Get()
  async getAllCurrencies(): Promise<Currency[]> {
    try {
      return await this.currenciesService.findAll();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch currencies');
    }
  }

  @Get('monitored')
  async getMonitoredCurrencies(
    @Query('userId') userId: string,
  ): Promise<CurrencyPair[]> {
    const validated = z.string().uuid().safeParse(userId);
    if (!validated.success) {
      throw new BadRequestException('Invalid userId format');
    }

    try {
      console.log('userId', userId);
      return await this.currenciesService.getMonitoredPairs(userId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch monitored pairs');
    }
  }

  @Post('monitor')
  async startMonitoringCurrencies(@Body() body: unknown) {
    const validated = StartMonitoringPairSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }
    try {
      return await this.currenciesService.startMonitoringPair(validated.data);
    } catch (error) {
      if (error instanceof CurrencyNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof DuplicatePairError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to start monitoring');
    }
  }

  @Patch('disable')
  async disableMonitored(@Body() body: unknown) {
    const validated = ToggleMonitoredPairSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }
    try {
      return await this.currenciesService.disableMonitoredPair(validated.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to disable monitoring');
    }
  }

  @Patch('enable')
  async enableMonitored(@Body() body: unknown) {
    const validated = ToggleMonitoredPairSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }
    try {
      return await this.currenciesService.enableMonitoredPair(validated.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to enable monitoring');
    }
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
    try {
      return await this.currenciesService.getRates(
        validated.data.from,
        validated.data.to,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch rates');
    }
  }

  @Get(':id')
  findById(@Param('id') id: string): string {
    return `This action returns a currency based on id - ${id}`;
  }
}
