import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetPostDto, UploadPostDto, UploadPostFilesDto } from './dtos';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { isAudio, isImage, isVideo } from 'src/common/mimetypes';
import { AuthGuard } from '../auth/guards';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async getPosts(@Query() dto: GetPostDto) {
    if (!dto.user_id) return this.mediaService.getMedias(dto.page, dto.limit);
    return this.mediaService.getPostsByUserId(dto.user_id, dto.page, dto.limit);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'media', maxCount: 1 },
      ],
      {
        limits: { fileSize: 1024 * 1024 * 1024 },
        fileFilter: (req, file: Express.Multer.File, callback) => {
          if (file.fieldname === 'thumbnail')
            if (isImage(file)) callback(null, true);
            else {
              callback(
                new Error('Invalid thumbnail file type: ' + file.mimetype),
                false,
              );
            }
          if (file.fieldname === 'media')
            if (isAudio(file) || isVideo(file)) callback(null, true);
            else {
              callback(
                new Error('Invalid media file type: ' + file.mimetype),
                false,
              );
            }
        },
      },
    ),
  )
  async uploadPost(
    @Request() request: any,
    @UploadedFiles() files: UploadPostFilesDto,
    @Body() dto: UploadPostDto,
  ) {
    return this.mediaService.uploadMedia(
      request.user,
      dto.title,
      dto.description,
      files,
    );
  }
}
