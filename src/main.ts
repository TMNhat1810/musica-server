/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { ConfigService } from '@nestjs/config';
import { ENV } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  setupSwagger(app);
  const port = app.get(ConfigService).get(ENV.PORT, 8080);
  await app.listen(port);

  console.log(`Application is running on port: ${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
