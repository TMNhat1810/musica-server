/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { appConfig } from './configs/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  setupSwagger(app);

  const { port } = appConfig;
  await app.listen(port);

  console.log(`Application is running on port: ${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
