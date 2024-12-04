import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ORIGIN || 'http://localhost:3001',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
