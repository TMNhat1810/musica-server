import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/services';
import { groupBy } from 'lodash';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMediaStatistics(media_id: string) {
    const stats = await this.prisma.mediaStats.findUnique({
      where: { media_id },
    });

    if (!stats) throw new NotFoundException('Statistics not found');

    return {
      media_id: stats.media_id,
      view_count: stats.view_count,
      total_watch_seconds: stats.total_watch_seconds,
      total_watch_hours: +(stats.total_watch_seconds / 3600).toFixed(2),
      average_watch_time: stats.view_count
        ? +(stats.total_watch_seconds / stats.view_count).toFixed(2)
        : 0,
    };
  }

  async getUserStatistics(user_id: string) {
    const userMedias = await this.prisma.media.findMany({
      where: { user_id: user_id },
      select: {
        id: true,
        MediaStatistics: true,
      },
    });

    const mediaCount = userMedias.length;
    const totalViews = userMedias.reduce(
      (sum, media) => sum + (media.MediaStatistics?.view_count || 0),
      0,
    );
    const totalWatchSeconds = userMedias.reduce(
      (sum, media) => sum + (media.MediaStatistics?.total_watch_seconds || 0),
      0,
    );

    return {
      user_id: user_id,
      media_count: mediaCount,
      total_view_count: totalViews,
      total_watch_seconds: totalWatchSeconds,
      total_watch_hours: +(totalWatchSeconds / 3600).toFixed(2),
      average_watch_time_per_media:
        mediaCount > 0 ? +(totalWatchSeconds / mediaCount).toFixed(2) : 0,
    };
  }

  async getGlobalStatistics() {
    const [userCount, mediaCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.media.count(),
    ]);

    const stats = await this.prisma.mediaStats.aggregate({
      _sum: {
        view_count: true,
        total_watch_seconds: true,
      },
    });

    const totalViews = stats._sum.view_count || 0;
    const totalWatchSeconds = stats._sum.total_watch_seconds || 0;

    return {
      total_users: userCount,
      total_media: mediaCount,
      total_view_count: totalViews,
      total_watch_seconds: totalWatchSeconds,
      total_watch_hours: +(totalWatchSeconds / 3600).toFixed(2),
      average_watch_time_per_view:
        totalViews > 0 ? +(totalWatchSeconds / totalViews).toFixed(2) : 0,
      average_watch_time_per_media:
        mediaCount > 0 ? +(totalWatchSeconds / mediaCount).toFixed(2) : 0,
    };
  }

  async getGroupedStatistics(group) {
    if (group) return this.getDailyViewStats();
  }

  async getDailyViewStats() {
    const logs = await this.prisma.viewLog.findMany({
      select: {
        viewed_at: true,
        watched_seconds: true,
      },
    });

    const grouped: Record<string, typeof logs> = groupBy(
      logs,
      (log: { viewed_at: string; watched_seconds: number }) =>
        new Date(log.viewed_at).toISOString().slice(0, 10),
    );

    return Object.entries(grouped).map(([date, logs]) => {
      const view_count = logs.length;
      const total_watch_seconds = logs.reduce(
        (sum, log) => sum + log.watched_seconds,
        0,
      );
      return {
        date,
        view_count,
        total_watch_seconds,
      };
    });
  }
}
