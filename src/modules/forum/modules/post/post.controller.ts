import {
  Body,
  Controller,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards';
import { PostService } from './post.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadPostDto, UploadPostFilesDto } from './dtos';

@ApiTags('Forum Post')
@Controller('forum/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

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
}
