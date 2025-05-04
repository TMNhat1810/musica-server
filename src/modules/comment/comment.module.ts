import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from '../database/services';
import { SocketGateway } from 'src/socket/socket.gateway';

@Module({
  imports: [],
  providers: [CommentService, PrismaService, SocketGateway],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
