import { Controller, Get, Param } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency } from './currencies.schema';

@Controller('currencies')
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}
  @Get()
  async getAllCurrencies(): Promise<Currency[]> {
    return this.currenciesService.findAll();
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
