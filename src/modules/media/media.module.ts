import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaService } from '../database/services';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [],
  providers: [MediaService, PrismaService, CloudinaryService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
