import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './schedulers.service';
import { HttpModule } from '@nestjs/axios';
import { CurrenciesService } from '../currencies/currencies.service';
import { RulesService } from '../rules/rules.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule, PrismaModule],
  providers: [SchedulerService, CurrenciesService, RulesService],
})
export class SchedulerModule {}
