import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './modules/schedulers/schedulers.module';

async function bootstrap() {
  const app = await NestFactory.create(SchedulerModule);
  await app.listen(3009);
  console.log('Scheduler is running...');
}

bootstrap();
