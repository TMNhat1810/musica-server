import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';
import { UploadPostDto, UploadPostFilesDto } from './dtos';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getForumPosts(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      this.prisma.forumPost.findMany({
        skip: skip,
        take: limit,
      }),
      this.prisma.forumPost.count(),
    ]);

    return {
      data: posts,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };
  }

  async uploadPost(
    user_id: string,
    payload: UploadPostDto,
    files: UploadPostFilesDto,
  ) {
    let uploadedImages: string[] = [];

    if (files?.images) {
      uploadedImages = await Promise.all(
        files.images.map(async (file) => {
          const result = await this.cloudinary.uploadImage(file);
          return result.url;
        }),
      );
    }

    const images = uploadedImages.map((url) => ({ url }));

    return await this.prisma.forumPost.create({
      data: {
        user_id: user_id,
        title: payload.title,
        type: payload.type,
        content: payload.content,
        images: { create: images },
      },
    });
  }

  async getForumPostById(id: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id },
      include: {
        user: {
          select: SafeUserPayload,
        },
        images: true,
      },
    });

    if (!post) return new NotFoundException();

    return post;
  }

  async getForumPostComment(id: string) {
    return await this.prisma.forumComment.findMany({
      where: { post_id: id },
      include: {
        user: { select: SafeUserPayload },
        replies: true,
      },
    });
  }

  async addCommentToPost(id: string, user_id: string, content: string) {
    return await this.prisma.forumComment.create({
      data: {
        post_id: id,
        user_id,
        content,
      },
      include: {
        user: { select: SafeUserPayload },
        replies: true,
      },
    });
  }

  async addReplyToComment(comment_id: string, user_id: string, content: string) {
    return await this.prisma.forumComment.create({
      data: {
        reply_to: comment_id,
        user_id,
        content,
      },
      include: {
        user: { select: SafeUserPayload },
      },
    });
  }
}
