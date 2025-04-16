import { Module } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { PrismaService } from '../database/services';

@Module({
  imports: [],
  providers: [PrismaService, RecommendService],
  exports: [RecommendService],
})
export class RecommendModule {}
