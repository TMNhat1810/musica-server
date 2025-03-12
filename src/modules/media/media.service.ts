import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/services';
import { UploadMediaFilesDto } from './dtos';
import { JwtPayload } from 'src/common/interfaces';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { isVideo } from 'src/common/mimetypes';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getMedias(page: number, limit: number, except?: string) {
    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        where: { id: { not: except } },
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

  async getMediaById(id: string) {
    return await this.prisma.media.findFirst({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            photo_url: true,
          },
        },
      },
    });
  }

  async getMediasByUserId(user_id: string, page: number, limit: number) {
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
    files: UploadMediaFilesDto,
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
        type: isVideo(mediaFile) ? 'video' : 'audio',
      },
    });
  }

  async getCommentsByMediaId(id: string) {
    const media = await this.prisma.media.findFirst({ where: { id: id } });
    if (!media) throw new NotFoundException('Media not found!');

    return await this.prisma.comment.findMany({
      where: { media_id: id },
      include: {
        replies: {
          include: {
            user: {
              select: {
                id: true,
                photo_url: true,
                display_name: true,
                username: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            photo_url: true,
            display_name: true,
            username: true,
          },
        },
      },
    });
  }

  async uploadComments(user: JwtPayload, id: string, content: string) {
    const media = await this.prisma.media.findFirst({ where: { id: id } });
    if (!media) throw new NotFoundException('Media not found!');

    return await this.prisma.comment.create({
      data: { user_id: user.user_id, media_id: id, content },
      include: {
        user: {
          select: {
            id: true,
            photo_url: true,
            display_name: true,
            username: true,
          },
        },
        replies: true,
      },
    });
  }

  async search(query: string) {
    return await this.prisma.media.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
      },
      include: {
        user: {
          select: {
            id: true,
            photo_url: true,
            display_name: true,
            username: true,
          },
        },
      },
    });
  }
}
