import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/services';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateUserProfileDto } from './dtos';

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

  async getUserMedia(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return await this.prisma.media.findMany({
      where: { user_id: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            photo_url: true,
            display_name: true,
          },
        },
      },
    });
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
}
