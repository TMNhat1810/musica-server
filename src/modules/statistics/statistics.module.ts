import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statitiscs.controller';
import { PrismaService } from 'src/modules/database/services';

@Module({
  imports: [],
  providers: [StatisticsService, PrismaService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}
