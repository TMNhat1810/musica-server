import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/services';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyFollowersOnNewMedia(media_id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id: media_id },
    });

    if (!media) throw new NotFoundException();

    const followers = await this.prisma.follow.findMany({
      where: { followee_id: media.user_id },
    });

    await this.prisma.notification.createMany({
      data: followers.map((follower) => ({
        user_id: follower.follower_id,
        media_id: media.id,
        type: 'NEW_MEDIA_UPLOAD',
      })),
    });

    return { success: true };
  }

  async createNewCommentNotification(media_id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id: media_id },
    });

    if (!media) throw new NotFoundException();
    const latestRecord = await this.prisma.notification.findFirst({
      where: {
        user_id: media.user_id,
        media_id,
        type: 'NEW_COMMENT',
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (latestRecord && !latestRecord.is_read)
      return { success: false, message: 'user not read' };

    return await this.prisma.notification.create({
      data: {
        type: 'NEW_COMMENT',
        media_id,
        user_id: media.user_id,
      },
    });
  }

  async markAsRead(id: string, user_id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
      },
    });

    if (!notification) throw new NotFoundException();
    if (notification.user_id !== user_id) throw new UnauthorizedException();

    return await this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async deleteNotification(id: string, user_id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
      },
    });

    if (!notification) throw new NotFoundException();
    if (notification.user_id !== user_id) throw new UnauthorizedException();

    return await this.prisma.notification.delete({ where: { id } });
  }
}
