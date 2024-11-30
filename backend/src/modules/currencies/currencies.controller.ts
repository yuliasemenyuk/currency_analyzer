import { Controller, Get, Param } from '@nestjs/common';

@Controller('currencies')
export class CurrenciesController {
  @Get()
  fingAll() {
    return 'This action returns all currencies';
  }

  @Get(':id')
  findById(@Param('id') id: string): string {
    return `This action returns a currency based on id - ${id}`;
  }

  // @Get()
  // async findAll(): Promise<any[]> {
  //   return [];
  // }

  // export class CreateCatDto {
  //     name: string;
  //     age: number;
  //     breed: string;
  //   }

  //   @Post()
  //   async create(@Body() createCatDto: CreateCatDto) {
  //     return 'This action adds a new cat';
  //   }
}
