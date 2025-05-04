import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaService } from '../database/services';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RecommendService } from '../recommend/recommend.service';
import { SocketGateway } from 'src/socket/socket.gateway';

@Module({
  imports: [],
  providers: [
    MediaService,
    PrismaService,
    CloudinaryService,
    RecommendService,
    SocketGateway,
  ],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
