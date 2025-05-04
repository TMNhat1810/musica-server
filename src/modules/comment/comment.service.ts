import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from 'src/common/interfaces';
import { PrismaService } from '../database/services';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadCommentReply(user: JwtPayload, id: string, content: string) {
    const comment = await this.prisma.comment.findFirst({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.comment.create({
      data: { user_id: user.user_id, reply_to: id, content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            photo_url: true,
          },
        },
      },
    });
  }

  async editMediaComment(user_id: string, comment_id: string, content: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: comment_id },
    });

    if (!comment) throw new NotFoundException();
    if (comment.user_id !== user_id) throw new UnauthorizedException();

    return await this.prisma.comment.update({
      where: { id: comment_id },
      data: { content },
      include: { user: { select: SafeUserPayload }, replies: true },
    });
  }

  async editForumComment(user_id: string, comment_id: string, content: string) {
    const comment = await this.prisma.forumComment.findFirst({
      where: { id: comment_id },
    });

    if (!comment) throw new NotFoundException();
    if (comment.user_id !== user_id) throw new UnauthorizedException();

    return await this.prisma.forumComment.update({
      where: { id: comment_id },
      data: { content },
      include: { user: { select: SafeUserPayload }, replies: true },
    });
  }
}
