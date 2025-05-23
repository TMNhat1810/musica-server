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

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        username: true,
        photo_url: true,
        display_name: true,
        email: true,
      },
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
}
