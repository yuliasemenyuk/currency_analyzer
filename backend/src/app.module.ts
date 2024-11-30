import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrenciesController } from './modules/currencies/currencies.controller';

@Module({
  imports: [],
  controllers: [AppController, CurrenciesController],
  providers: [AppService],
})
export class AppModule {}
