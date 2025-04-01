import { Module } from '@nestjs/common';
import { PrismaService } from '../database/services';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { ForumModules } from './modules';

@Module({
  imports: [...ForumModules],
  providers: [ForumService, PrismaService],
  controllers: [ForumController],
  exports: [ForumService],
})
export class ForumModule {}
