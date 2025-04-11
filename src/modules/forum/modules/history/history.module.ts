import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [],
  providers: [HistoryService, PrismaService],
  controllers: [HistoryController],
  exports: [HistoryService],
})
export class HistoryModule {}
