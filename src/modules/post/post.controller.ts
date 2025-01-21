import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { GetPostDto } from './dtos';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@Query() dto: GetPostDto) {
    if (!dto.user_id) return this.postService.getPosts(dto.page, dto.limit);
    return this.postService.getPostsByUserId(dto.user_id, dto.page, dto.limit);
  }
}
