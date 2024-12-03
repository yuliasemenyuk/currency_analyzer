import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './modules/schedulers/schedulers.module';

async function bootstrap() {
  await NestFactory.create(SchedulerModule);
  console.log('Scheduler is running...');
}

bootstrap();
