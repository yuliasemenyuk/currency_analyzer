import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { PrismaModule } from 'prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { RulesModule } from './modules/rules/rules.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    CurrenciesModule,
    RulesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
