import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards';
import { PostService } from './post.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  UploadPostDto,
  UploadPostFilesDto,
  GetPostsDto,
  UploadForumPostCommentDto,
} from './dtos';

@ApiTags('Forum Post')
@Controller('forum/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('')
  async getForumPosts(@Query() pagination: GetPostsDto) {
    const posts = await this.postService.getForumPosts(
      pagination.page,
      pagination.limit,
    );
    return posts;
  }

  @Post('')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 20 }]))
  async createPost(
    @Request() req: any,
    @Body() dto: UploadPostDto,
    @UploadedFiles() files: UploadPostFilesDto,
  ) {
    return this.postService.uploadPost(req.user.user_id, dto, files);
  }

  @Get(':id')
  async getForumPostById(@Param('id') id: string) {
    return this.postService.getForumPostById(id);
  }

  @Get(':id/comment')
  async getForumPostComment(@Param('id') id: string) {
    return this.postService.getForumPostComment(id);
  }

  @Post(':id/comment')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async addCommentToForumPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UploadForumPostCommentDto,
  ) {
    return this.postService.addCommentToPost(id, req.user.user_id, dto.content);
  }

  @Post('comment/:id/reply')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async addReplyToForumComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UploadForumPostCommentDto,
  ) {
    return this.postService.addReplyToComment(id, req.user.user_id, dto.content);
  }
}
