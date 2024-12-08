import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
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
  RateQuerySchema,
  MonitoringPairRequestSchema,
  ToggleMonitorRequestSchema,
  MonitoringPairServiceSchema,
  ToggleMonitorServiceSchema,
} from './currencies.schema';
import { User } from '../../common/decorators/user.decorator';
import {
  DuplicatePairError,
  PairNotFoundError,
  InvalidCurrencyDataError,
  SameCurrencyError,
} from './currencies.errors';
import { CurrencyPair } from '@prisma/client';
// import z from 'zod';

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

  // @Get('monitored')
  // @UseGuards(BasicAuthGuard)
  // async getMonitoredCurrencies(
  //   @User() user,
  //   @Query('userId') userId: string,
  // ): Promise<CurrencyPair[]> {
  //   console.log('user', user);
  //   const validated = z.string().uuid().safeParse(userId);

  //   if (!validated.success) {
  //     throw new BadRequestException('Invalid user id format');
  //   }

  //   try {
  //     return await this.currenciesService.getMonitoredPairs(validated.data);
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to fetch monitored pairs');
  //   }
  // }
  @Get('monitored')
  @UseGuards(JwtAuthGuard)
  async getMonitoredCurrencies(@User() user): Promise<CurrencyPair[]> {
    try {
      return await this.currenciesService.getMonitoredPairs(user.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch monitored pairs');
    }
  }

  @Post('monitor')
  @UseGuards(JwtAuthGuard)
  async startMonitoringCurrencies(@User() user, @Body() body: unknown) {
    const validated = MonitoringPairRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    const serviceData = MonitoringPairServiceSchema.parse({
      ...validated.data,
      userId: user.id,
    });

    try {
      return await this.currenciesService.startMonitoringPair(serviceData);
    } catch (error) {
      if (error instanceof SameCurrencyError) {
        throw new BadRequestException((error as Error).message);
      }
      if (error instanceof PairNotFoundError) {
        throw new NotFoundException((error as Error).message);
      }
      if (error instanceof DuplicatePairError) {
        throw new ConflictException((error as Error).message);
      }
      throw new InternalServerErrorException('Failed to start monitoring');
    }
  }

  @Patch('disable')
  @UseGuards(JwtAuthGuard)
  async disableMonitored(@User() user, @Body() body: unknown) {
    const validated = ToggleMonitorRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
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
  async enableMonitored(@User() user, @Body() body: unknown) {
    const validated = ToggleMonitorRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
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
    } catch (error) {
      if (error instanceof InvalidCurrencyDataError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch rates');
    }
  }

  // @Get('rates')
  // async getRates(@Query() query: unknown) {
  //   const validated = RateQuerySchema.safeParse(query);
  //   if (!validated.success) {
  //     throw new BadRequestException(validated.error.errors);
  //   }

  //   if (validated.data.from === validated.data.to) {
  //     throw new BadRequestException('From and to currencies must be different');
  //   }

  //   try {
  //     return await this.currenciesService.getRates(
  //       validated.data.from,
  //       validated.data.to,
  //     );
  //   } catch (error) {
  //     if (error instanceof InvalidCurrencyDataError) {
  //       throw new BadRequestException(error.message);
  //     }
  //     throw new InternalServerErrorException('Failed to fetch rates');
  //   }
  // }

  @Get(':id')
  findById(@Param('id') id: string): string {
    return `This action returns a currency based on id - ${id}`;
  }
}
