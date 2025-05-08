import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { AuthGuard } from '../auth/guards';
import { DeleteCommentDto, EditCommentDto, ReplyCommentDto } from './dtos';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async editComment(
    @Request() request: any,
    @Param('id') id: string,
    @Body() dto: EditCommentDto,
  ) {
    if (dto.forum)
      return this.commentService.editForumComment(
        request.user.user_id,
        id,
        dto.content,
      );
    return this.commentService.editMediaComment(
      request.user.user_id,
      id,
      dto.content,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteComment(
    @Request() request: any,
    @Param('id') id: string,
    @Query() dto: DeleteCommentDto,
  ) {
    if (dto.forum)
      return this.commentService.deleteForumComment(request.user.user_id, id);
    return this.commentService.deleteMediaComment(request.user.user_id, id);
  }

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
