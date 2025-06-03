import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../database/services';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService, PrismaService],
  controllers: [NotificationController],
  exports: [],
})
export class NotificationModule {}
