import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/services';
import { SearchMediaDto, UpdateMediaDto, UploadMediaFilesDto } from './dtos';
import { JwtPayload } from 'src/common/interfaces';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { isVideo } from 'src/common/mimetypes';
import { RecommendService } from '../recommend/recommend.service';
import { v4 as uuid } from 'uuid';
import { extractThumbnail, makeTmp, readThumbnail } from 'src/utils/video';
import { unlink } from 'fs/promises';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly recommender: RecommendService,
    private readonly socketGatewat: SocketGateway,
  ) {}

  async getMedias(page: number, limit: number, except?: string) {
    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        where: { id: { not: except } },
        skip: ((page - 1) * limit) | 0,
        take: limit,
        include: {
          user: {
            select: SafeUserPayload,
          },
          MediaStatistics: { select: { view_count: true } },
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

  async getSuggestMedias(page: number, limit: number, from_id: string) {
    const recommends = (await this.recommender.searchById(from_id)) as any[];
    if (!recommends) return this.getMedias(page, limit, from_id);

    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        where: {
          id: {
            in: recommends.map((item) => item.id).filter((id) => id !== from_id),
          },
        },
        skip: ((page - 1) * limit) | 0,
        take: limit,
        include: {
          user: {
            select: SafeUserPayload,
          },
          MediaStatistics: { select: { view_count: true } },
        },
      }),
      this.prisma.media.count(),
    ]);

    return { medias, totalRecords };
  }

  async getMediaById(id: string) {
    return await this.prisma.media.findFirst({
      where: { id },
      include: {
        user: {
          select: SafeUserPayload,
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
            select: SafeUserPayload,
          },
          MediaStatistics: { select: { view_count: true } },
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
              select: SafeUserPayload,
            },
          },
        },
        user: {
          select: SafeUserPayload,
        },
      },
    });
  }

  async uploadComments(user: JwtPayload, id: string, content: string) {
    const media = await this.prisma.media.findFirst({ where: { id: id } });
    if (!media) throw new NotFoundException('Media not found!');

    const comment = await this.prisma.comment.create({
      data: { user_id: user.user_id, media_id: id, content },
      include: {
        user: {
          select: SafeUserPayload,
        },
        replies: true,
      },
    });

    this.socketGatewat.emitToRoom(id, 'comment:new', comment);

    return comment;
  }

  async searchWithoutRS(dto: SearchMediaDto) {
    const { query, limit, page } = dto;
    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        where: {
          OR: [
            { id: dto.query },
            { title: { contains: query, mode: 'insensitive' } },
          ],
          status: 'active',
        },
        skip: ((page - 1) * limit) | 0,
        take: limit,
        include: {
          user: {
            select: SafeUserPayload,
          },
          MediaStatistics: { select: { view_count: true } },
        },
      }),
      this.prisma.media.count({
        where: {
          OR: [
            { id: dto.query },
            { title: { contains: query, mode: 'insensitive' } },
          ],
          status: 'active',
        },
      }),
    ]);
    return { medias, totalPages: Math.ceil(totalRecords / limit) };
  }

  async search(query: string) {
    const medias = await this.prisma.media.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
      },
      include: {
        user: {
          select: SafeUserPayload,
        },
        MediaStatistics: { select: { view_count: true } },
      },
    });

    const fromRecommender = await this.recommender.searchByTitle(query);

    let mediaFromRecommender = [];

    if (fromRecommender) {
      const ids = fromRecommender
        .map((item) => item.id)
        .filter((id) => !medias.map((item) => item.id).includes(id));

      mediaFromRecommender = await this.prisma.media.findMany({
        where: { id: { in: ids } },
        include: {
          user: {
            select: SafeUserPayload,
          },
        },
      });
    }

    return {
      data: medias,
      from_recommender: fromRecommender ? mediaFromRecommender : null,
    };
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

  async addViewLog(id: string, user_id: string, watched_seconds: number) {
    await this.prisma.viewLog.create({
      data: {
        media_id: id,
        user_id,
        watched_seconds,
      },
    });

    await this.prisma.mediaStats.upsert({
      where: { media_id: id },
      update: {
        view_count: { increment: 1 },
        total_watch_seconds: { increment: watched_seconds },
      },
      create: {
        media_id: id,
        view_count: 1,
        total_watch_seconds: watched_seconds,
      },
    });

    return { success: true };
  }

  async getPendingMedias(dto: SearchMediaDto) {
    const { query, page, limit } = dto;

    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        skip: ((page - 1) * limit) | 0,
        take: limit,
        where: {
          OR: [{ id: query }, { title: { contains: query, mode: 'insensitive' } }],
          status: 'pending',
        },
        include: {
          user: {
            select: SafeUserPayload,
          },
          MediaStatistics: { select: { view_count: true } },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.media.count({
        where: {
          OR: [{ id: query }, { title: { contains: query, mode: 'insensitive' } }],
          status: 'pending',
        },
      }),
    ]);
    return {
      medias,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  async addLikeMedia(user_id: string, media_id: string) {
    const record = await this.prisma.history.findFirst({
      where: { user_id, link_to_media: media_id, action: 'like_media' },
    });

    if (record) throw new BadRequestException('Already liked media');

    return this.prisma.history.create({
      data: { user_id, link_to_media: media_id, action: 'like_media' },
    });
  }

  async removeLikeMedia(user_id: string, media_id: string) {
    const record = await this.prisma.history.findFirst({
      where: { user_id, link_to_media: media_id, action: 'like_media' },
    });

    if (!record) throw new NotFoundException('Record not found');

    return this.prisma.history.deleteMany({
      where: { user_id, link_to_media: media_id, action: 'like_media' },
    });
  }

  async isUserLikedMedia(user_id: string, media_id: string) {
    const record = await this.prisma.history.findFirst({
      where: { user_id, link_to_media: media_id, action: 'like_media' },
    });

    return { data: !!record };
  }
}
