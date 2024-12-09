import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { SchedulerService } from './schedulers.service';
import { HttpModule } from '@nestjs/axios';
import { CurrenciesService } from '../currencies/currencies.service';
import { RulesService } from '../rules/rules.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    PrismaModule,
    PrometheusModule.register({
      path: '/metrics',
    }),
  ],
  providers: [
    SchedulerService,
    CurrenciesService,
    RulesService,
    makeCounterProvider({
      name: 'scheduler_cron_executions_total',
      help: 'The total number of times the scheduler cron job has executed',
    }),
    makeGaugeProvider({
      name: 'scheduler_active_rules',
      help: 'The number of active rules',
    }),
  ],
})
export class SchedulerModule {}
