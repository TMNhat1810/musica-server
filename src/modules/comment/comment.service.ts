import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from 'src/common/interfaces';
import { PrismaService } from '../database/services';
import { SafeUserPayload } from 'src/common/payload/SafeUserPayload';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async uploadCommentReply(user: JwtPayload, id: string, content: string) {
    const comment = await this.prisma.comment.findFirst({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    const reply = await this.prisma.comment.create({
      data: { user_id: user.user_id, reply_to: id, content },
      include: {
        user: {
          select: SafeUserPayload,
        },
      },
    });

    const parent = await this.prisma.comment.findFirst({
      where: {
        id: reply.reply_to,
      },
    });

    this.socketGateway.emitToRoom(parent.media_id, 'reply:new', reply);

    return reply;
  }

  async editMediaComment(user_id: string, comment_id: string, content: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: comment_id },
    });

    if (!comment) throw new NotFoundException();
    if (comment.user_id !== user_id) throw new UnauthorizedException();

    const updatedComment = await this.prisma.comment.update({
      where: { id: comment_id },
      data: { content },
      include: { user: { select: SafeUserPayload }, replies: true },
    });

    if (comment.media_id) {
      this.socketGateway.emitToRoom(
        comment.media_id,
        'comment:update',
        updatedComment,
      );
    } else {
      const tmp = await this.prisma.comment.findFirst({
        where: { id: comment.reply_to },
      });

      this.socketGateway.emitToRoom(tmp.media_id, 'reply:update', updatedComment);
    }

    return updatedComment;
  }

  async editForumComment(user_id: string, comment_id: string, content: string) {
    const comment = await this.prisma.forumComment.findFirst({
      where: { id: comment_id },
    });

    if (!comment) throw new NotFoundException();
    if (comment.user_id !== user_id) throw new UnauthorizedException();

    const updatedComment = await this.prisma.forumComment.update({
      where: { id: comment_id },
      data: { content },
      include: { user: { select: SafeUserPayload }, replies: true },
    });

    if (comment.post_id) {
      this.socketGateway.emitToRoom(
        comment.post_id,
        'comment:update',
        updatedComment,
      );
    } else {
      const tmp = await this.prisma.forumComment.findFirst({
        where: { id: comment_id },
        include: {
          parent: true,
        },
      });

      this.socketGateway.emitToRoom(
        tmp.parent.post_id,
        'reply:update',
        updatedComment,
      );
    }

    return updatedComment;
  }
}
