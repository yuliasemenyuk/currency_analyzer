import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Currency,
  MonitoringPairRequestSchema,
  ToggleMonitorRequestSchema,
  MonitoringPairServiceSchema,
  ToggleMonitorServiceSchema,
  MonitoredPairResponse,
} from './currencies.schema';
import { User } from '../../common/decorators/user.decorator';
import {
  DuplicatePairError,
  PairNotFoundError,
  InvalidCurrencyDataError,
  SameCurrencyError,
} from './currencies.errors';

@Controller('currencies')
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}

  @Get()
  async getAllCurrencies(): Promise<Currency[]> {
    try {
      return await this.currenciesService.findAll();
    } catch (error) {
      if (error instanceof InvalidCurrencyDataError) {
        throw new BadRequestException((error as Error).message);
      }
      throw new InternalServerErrorException('Failed to fetch currencies');
    }
  }

  @Get('monitored')
  @UseGuards(JwtAuthGuard)
  async getMonitoredCurrencies(
    @User() user: { id: string },
  ): Promise<MonitoredPairResponse[]> {
    try {
      return await this.currenciesService.getMonitoredPairs(user.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch monitored pairs');
    }
  }

  @Post('monitor')
  @UseGuards(JwtAuthGuard)
  async startMonitoringCurrencies(
    @User() user: { id: string },
    @Body() body: unknown,
  ): Promise<void> {
    const validated = MonitoringPairRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors[0].message);
    }

    const serviceData = MonitoringPairServiceSchema.parse({
      ...validated.data,
      userId: user.id,
    });

    try {
      await this.currenciesService.startMonitoringPair(serviceData);
    } catch (error) {
      if (error instanceof SameCurrencyError) {
        throw new BadRequestException((error as Error).message);
      }
      if (error instanceof DuplicatePairError) {
        throw new ConflictException((error as Error).message);
      }
      throw new InternalServerErrorException('Failed to start monitoring');
    }
  }

  @Patch('disable')
  @UseGuards(JwtAuthGuard)
  async disableMonitored(@User() user: { id: string }, @Body() body: unknown) {
    const validated = ToggleMonitorRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors[0].message);
    }

    const serviceData = ToggleMonitorServiceSchema.parse({
      ...validated.data,
      userId: user.id,
    });
    try {
      return await this.currenciesService.disableMonitoredPair(serviceData);
    } catch (error) {
      if (error instanceof PairNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to disable monitoring');
    }
  }

  @Patch('enable')
  @UseGuards(JwtAuthGuard)
  async enableMonitored(@User() user: { id: string }, @Body() body: unknown) {
    const validated = ToggleMonitorRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors[0].message);
    }

    const serviceData = ToggleMonitorServiceSchema.parse({
      ...validated.data,
      userId: user.id,
    });

    try {
      return await this.currenciesService.enableMonitoredPair(serviceData);
    } catch (error) {
      if (error instanceof PairNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to enable monitoring');
    }
  }

  @Delete(':pairId')
  @UseGuards(JwtAuthGuard)
  async deleteMonitored(
    @User() user: { id: string },
    @Param('pairId') pairId: string,
  ) {
    try {
      return await this.currenciesService.deleteMonitoredPair(user.id, pairId);
    } catch (error) {
      if (error instanceof PairNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to delete monitored pair');
    }
  }
}
