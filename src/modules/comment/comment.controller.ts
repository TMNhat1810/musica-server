import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { AuthGuard } from '../auth/guards';
import { ReplyCommentDto } from './dtos';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':id/reply')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async uploadCommentReply(
    @Request() request: any,
    @Param('id') id: string,
    @Body() dto: ReplyCommentDto,
  ) {
    return this.commentService.uploadCommentReply(request.user, id, dto.content);
  }
}
