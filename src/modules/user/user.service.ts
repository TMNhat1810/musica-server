import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/services';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  GetPaginationByTitleDto,
  SearchUserDto,
  UpdateUserProfileDto,
} from './dtos';
import { hashSync } from 'bcryptjs';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { ...SafeUserPayload, _count: { select: { followers: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async searchUsers(dto: SearchUserDto) {
    const { query, limit, page } = dto;

    const [users, totalRecords] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { display_name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: SafeUserPayload,
        skip: ((page - 1) * limit) | 0,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { display_name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { users, totalPages: Math.ceil(totalRecords / limit) };
  }

  async getUserMedia(id: string, dto: GetPaginationByTitleDto) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { page, limit } = dto;
    let condition = {};
    if (dto.query) {
      condition = {
        user_id: id,
        OR: [
          { id: dto.query },
          { title: { contains: dto.query, mode: 'insensitive' } },
        ],
      };
    } else {
      condition = { user_id: id };
    }
    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        where: condition,
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
      this.prisma.media.count({ where: condition }),
    ]);
    return { medias, totalPages: Math.ceil(totalRecords / limit) };
  }

  async getUserForumPost(id: string, dto: GetPaginationByTitleDto) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { page, limit } = dto;
    let condition = {};
    if (dto.query) {
      condition = {
        user_id: id,
        OR: [
          { id: dto.query },
          { title: { contains: dto.query, mode: 'insensitive' } },
        ],
      };
    } else {
      condition = { user_id: id };
    }
    const [posts, totalRecords] = await Promise.all([
      this.prisma.forumPost.findMany({
        where: condition,
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
          _count: { select: { ForumComment: true } },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.forumPost.count({ where: condition }),
    ]);
    return { posts, totalPages: Math.ceil(totalRecords / limit) };
  }

  async updateUserAvatar(id: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { url } = await this.cloudinary.uploadImage(file);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { photo_url: url },
      select: {
        id: true,
        username: true,
        photo_url: true,
        display_name: true,
        email: true,
      },
    });

    this.cloudinary.deleteMedia(user.photo_url);

    return updatedUser;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    return await this.prisma.user.update({
      where: { id },
      data: { display_name: dto.display_name },
      select: {
        id: true,
        username: true,
        photo_url: true,
        display_name: true,
        email: true,
      },
    });
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (hashSync(currentPassword, user.salt) !== user.password)
      throw new BadRequestException('Current password is incorrect');

    const hashedPassword = hashSync(newPassword, user.salt);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        photo_url: true,
        display_name: true,
        email: true,
      },
    });
  }

  async checkUserFollowing(follower_id: string, followee_id: string) {
    const record = await this.prisma.follow.findFirst({
      where: {
        follower_id,
        followee_id,
      },
    });

    return { data: !!record };
  }

  async followUser(follower_id: string, followee_id: string) {
    if (followee_id === follower_id)
      throw new BadRequestException('Cannot self-follow');

    const record = await this.prisma.follow.findFirst({
      where: {
        follower_id,
        followee_id,
      },
    });
    if (record) throw new BadRequestException('User already followed');

    return this.prisma.follow.create({
      data: {
        follower_id,
        followee_id,
      },
    });
  }

  async unfollowUser(follower_id: string, followee_id: string) {
    const record = await this.prisma.follow.findFirst({
      where: {
        follower_id,
        followee_id,
      },
    });

    if (!record) throw new NotFoundException();

    return this.prisma.follow.deleteMany({
      where: {
        follower_id,
        followee_id,
      },
    });
  }

  async getUserFollowees(user_id: string) {
    return this.prisma.follow.findMany({
      where: {
        follower_id: user_id,
      },
      include: {
        followee: { select: SafeUserPayload },
      },
    });
  }

  async getUserFolloweesMedias(user_id: string, dto: PaginationDto) {
    const records = await this.prisma.follow.findMany({
      where: {
        follower_id: user_id,
      },
    });

    const ids: string[] = records.map((record) => record.followee_id);
    const { page, limit } = dto;

    const [medias, totalRecords] = await Promise.all([
      this.prisma.media.findMany({
        where: {
          user_id: { in: ids },
          status: 'active',
        },
        include: {
          user: { select: SafeUserPayload },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: ((page - 1) * limit) | 0,
        take: limit,
      }),
      this.prisma.media.count({
        where: {
          user_id: { in: ids },
          status: 'active',
        },
      }),
    ]);

    return { medias, totalPages: Math.ceil(totalRecords / limit) };
  }

  async getUserNotification(user_id: string) {
    return await this.prisma.notification.findMany({
      where: { user_id },
      include: { media: { include: { user: { select: SafeUserPayload } } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async getUserUnreadNotification(user_id: string) {
    const [notifications, totalNotifications] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id, is_read: false },
        include: { media: { include: { user: { select: SafeUserPayload } } } },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where: { user_id, is_read: false } }),
    ]);
    return { notifications, count: totalNotifications };
  }

  async readAllUserNotification(user_id: string) {
    return await this.prisma.notification.updateMany({
      where: {
        user_id,
      },
      data: {
        is_read: true,
      },
    });
  }
}
