import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from '../database/services';

@Module({
  imports: [],
  providers: [CommentService, PrismaService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
