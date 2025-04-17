import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/services';
import { UpdateMediaDto, UploadMediaFilesDto } from './dtos';
import { JwtPayload } from 'src/common/interfaces';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { isVideo } from 'src/common/mimetypes';
import { RecommendService } from '../recommend/recommend.service';
import { v4 as uuid } from 'uuid';
import { extractThumbnail, makeTmp, readThumbnail } from 'src/utils/video';
import { unlink } from 'fs/promises';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly recommender: RecommendService,
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
    duration: number,
    files: UploadMediaFilesDto,
  ) {
    if (!files.media) throw new BadRequestException('No media file found');
    const mediaFile = files.media[0];
    const id = uuid();

    let [media, thumbnail, vectorUpload] = [null, null, null];

    if (isVideo(mediaFile)) {
      const tmpPath = await makeTmp(mediaFile, id);
      const thumbnailPath = await extractThumbnail(tmpPath);

      [media, thumbnail, vectorUpload] = await Promise.all([
        this.cloudinary.uploadFromTmp(tmpPath, id),
        files.thumbnail
          ? this.cloudinary.uploadImage(files.thumbnail[0])
          : this.cloudinary.uploadFileFromBuffer(await readThumbnail(thumbnailPath)),
        this.recommender.uploadVector(id, title, mediaFile),
        () => {},
      ]);

      unlink(thumbnailPath);
      unlink(tmpPath);
    } else {
      [media, thumbnail, vectorUpload] = await Promise.all([
        this.cloudinary.uploadAudio(mediaFile),
        files.thumbnail ? this.cloudinary.uploadImage(files.thumbnail[0]) : null,
        this.recommender.uploadVector(id, title, mediaFile),
        () => {},
      ]);
    }

    return await this.prisma.media.create({
      data: {
        id,
        user_id: user.user_id,
        title: title.trim(),
        description: description.trim(),
        media_url: media.url,
        duration,
        thumbnail_url: thumbnail?.url,
        type: isVideo(mediaFile) ? 'video' : 'audio',
        vector_uploaded: vectorUpload.success || false,
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

  async updateMedia(id: string, user_id: string, data: UpdateMediaDto) {
    return { id, user_id, data };
  }

  async deleteMedia(id: string, user_id: string) {
    const media = await this.prisma.media.findFirst({ where: { id } });
    if (!media) throw new NotFoundException();
    if (media.user_id !== user_id) throw new UnauthorizedException();

    const [rsCallback] = await Promise.all([
      this.recommender.deleteVector(id),
      this.prisma.media.delete({ where: { id } }),
      this.cloudinary.deleteMedia(media.media_url),
      this.cloudinary.deleteImage(media.thumbnail_url),
    ]);

    return { success: true, rsCallback };
  }
}
