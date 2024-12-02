import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrenciesController } from './modules/currencies/currencies.controller';
import { CurrenciesService } from './modules/currencies/currencies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [AppController, CurrenciesController],
  providers: [AppService, CurrenciesService],
})
export class AppModule {}
