import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';

@Module({
  imports: [],
  providers: [PostService, PrismaService, CloudinaryService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
