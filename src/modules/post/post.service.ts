import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/services';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts(page: number, limit: number) {
    try {
      const [posts, totalRecords] = await Promise.all([
        this.prisma.post.findMany({
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
        this.prisma.post.count(),
      ]);
      return {
        posts,
        totalPages: Math.ceil(totalRecords / limit),
      };
    } catch (err) {
      throw err;
    }
  }

  async getPostsByUserId(user_id: string, page: number, limit: number) {
    try {
      const [posts, totalRecords] = await Promise.all([
        this.prisma.post.findMany({
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
        this.prisma.post.count({
          where: { user_id },
        }),
      ]);
      return {
        posts,
        totalPages: Math.ceil(totalRecords / limit),
      };
    } catch (err) {
      throw err;
    }
  }
}
