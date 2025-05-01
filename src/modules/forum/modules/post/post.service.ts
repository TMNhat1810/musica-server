import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/database/services';
import { UpdatePostDto, UploadPostDto, UploadPostFilesDto } from './dtos';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async authorized(
    user_id: string,
    { post_id, comment_id }: { post_id?: string; comment_id?: string },
  ) {
    if (post_id) {
      const post = await this.prisma.forumPost.findFirst({ where: { id: post_id } });
      if (user_id === post.user_id) return true;
    }
    if (comment_id) {
      const comment = await this.prisma.forumComment.findFirst({
        where: { id: comment_id },
      });
      if (user_id === comment.user_id) return true;
    }
    return false;
  }

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
        replies: { include: { user: { select: SafeUserPayload } } },
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

  async editPost(
    id: string,
    user_id: string,
    payload: UpdatePostDto,
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

    if (payload.deleteIds.length > 0) {
      const deleteImages = await this.prisma.image.findMany({
        where: { id: { in: payload.deleteIds } },
      });

      deleteImages.forEach((image) => {
        this.cloudinary.deleteImage(image.url);
      });
    }

    return await this.prisma.forumPost.update({
      where: { id },
      data: {
        title: payload.title,
        type: payload.type,
        content: payload.content,
        images: { create: images, deleteMany: { id: { in: payload.deleteIds } } },
      },
      include: { user: { select: SafeUserPayload }, images: true },
    });
  }

  async editComment(comment_id: string, new_content: string) {
    return await this.prisma.forumComment.update({
      where: { id: comment_id },
      data: {
        content: new_content,
      },
    });
  }

  async deleteForumPost(id: string, user_id: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: {
        id,
      },
      include: {
        images: true,
        user: true,
      },
    });

    if (!post) throw new NotFoundException();
    if (post.user.id !== user_id) throw new UnauthorizedException();

    post.images.forEach((image) => {
      this.cloudinary.deleteImage(image.url).catch();
    });

    await this.prisma.forumPost.delete({ where: { id } });

    return { success: true };
  }
}
