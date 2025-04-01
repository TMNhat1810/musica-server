import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';
import { UploadPostDto, UploadPostFilesDto } from './dtos';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadPost(
    user_id: string,
    payload: UploadPostDto,
    files: UploadPostFilesDto,
  ) {
    let uploadedImages: string[] = [];

    if (files?.images) {
      uploadedImages = await Promise.all(
        files.images.map(async (file) => {
          const result = await this.cloudinary.uploadImage(file);
          return result.url;
        }),
      );
    }

    const images = uploadedImages.map((url) => ({ url }));

    return await this.prisma.forumPost.create({
      data: {
        user_id: user_id,
        title: payload.title,
        type: payload.type,
        content: payload.content,
        images: { create: images },
      },
    });
  }
}
