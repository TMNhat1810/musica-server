import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from 'src/common/interfaces';
import { PrismaService } from '../database/services';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadCommentReply(user: JwtPayload, id: string, content: string) {
    const comment = await this.prisma.comment.findFirst({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.comment.create({
      data: { user_id: user.user_id, reply_to: id, content },
    });
  }
}
