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
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    PrismaModule,
    EmailModule,
    PrometheusModule.register({
      path: '/metrics',
    }),
  ],
  providers: [
    SchedulerService,
    CurrenciesService,
    RulesService,
    makeCounterProvider({
      name: 'notification_emails_sent_total',
      help: 'The total number of sent notification emails',
    }),
    makeCounterProvider({
      name: 'satisfied_rules_total',
      help: 'The total number of satisfied rules',
    }),
    makeGaugeProvider({
      name: 'currency_rate_changes',
      help: 'Currency rate changes',
      labelNames: ['pair'],
    }),
  ],
})
export class SchedulerModule {}
