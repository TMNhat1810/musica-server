import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/services';
import { UploadPostFilesDto } from './dtos';
import { JwtPayload } from 'src/common/interfaces';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { isVideo } from 'src/common/mimetypes';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getMedias(page: number, limit: number) {
    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        skip: ((page - 1) * limit) | 0,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              username: true,
              photo_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.media.count(),
    ]);
    return {
      medias,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  async getPostsByUserId(user_id: string, page: number, limit: number) {
    const [posts, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        skip: ((page - 1) * limit) | 0,
        take: limit,
        where: { user_id },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              username: true,
              photo_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.media.count({
        where: { user_id },
      }),
    ]);
    return {
      posts,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  async uploadMedia(
    user: JwtPayload,
    title: string,
    description: string,
    files: UploadPostFilesDto,
  ) {
    if (!files.media) throw new BadRequestException('No media file found');
    const mediaFile = files.media[0];

    const [media, thumbnail] = await Promise.all([
      isVideo(mediaFile)
        ? this.cloudinary.uploadVideo(mediaFile)
        : this.cloudinary.uploadAudio(mediaFile),
      files.thumbnail ? this.cloudinary.uploadImage(files.thumbnail[0]) : null,
    ]);

    return await this.prisma.media.create({
      data: {
        user_id: user.user_id,
        title: title.trim(),
        description: description.trim(),
        media_url: media.url,
        thumbnail_url: thumbnail?.url,
      },
    });
  }
}
