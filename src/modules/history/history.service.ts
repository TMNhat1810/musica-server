import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';
import { GetUserHistoryDto } from './dtos';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserHistory(user_id: string, dto: GetUserHistoryDto) {
    const { page, limit } = dto;
    const skip = (page - 1) * limit;

    const [logs, totalLogs] = await Promise.all([
      this.prisma.history.findMany({
        where: { user_id },
        skip: skip,
        take: limit,
        include: {
          media: {
            include: { user: { select: SafeUserPayload } },
          },
        },
      }),
      this.prisma.history.count({ where: { user_id } }),
    ]);

    return {
      logs,
      totalPages: Math.ceil(totalLogs / limit),
    };
  }

  async logUserViewMedia(user_id: string, media_id: string) {
    return this.prisma.history.create({
      data: {
        user_id,
        link_to_media: media_id,
        action: 'view_media',
      },
    });
  }

  async logUserLikeMedia(user_id: string, media_id: string) {
    return this.prisma.history.create({
      data: {
        user_id,
        link_to_media: media_id,
        action: 'like_media',
      },
    });
  }
}
