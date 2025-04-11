import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async logUserViewMedia(user_id: string, media_id: string) {
    return this.prisma.history.create({
      data: {
        user_id,
        link_to_media: media_id,
        action: 'view_media',
      },
    });
  }
}
