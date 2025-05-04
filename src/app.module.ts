import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './modules/database/services';
import { LoggerMiddleware } from './middlewares/logger';
import { Modules } from './modules';
import { SocketGateway } from './socket/socket.gateway';

@Module({
  imports: [...Modules],
  controllers: [AppController],
  providers: [AppService, PrismaService, SocketGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
