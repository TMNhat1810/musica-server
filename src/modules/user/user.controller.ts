import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { isImage } from 'src/common/mimetypes';
import { UpdateUserPasswordDto, UpdateUserProfileDto } from './dtos';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get(':id/media')
  async getUserMedia(@Param('id') id: string) {
    return this.userService.getUserMedia(id);
  }

  @Patch('c/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiBody({
    description: 'File upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file: Express.Multer.File, callback) => {
        if (!isImage(file)) {
          callback(new BadRequestException('Only image files are allowed!'), false);
        } else {
          callback(null, true);
        }
      },
    }),
  )
  async updateUserAvatar(
    @Request() request: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateUserAvatar(request.user.user_id, file);
  }

  @Patch('c/profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateProfile(@Request() request: any, @Body() dto: UpdateUserProfileDto) {
    return this.userService.updateProfile(request.user.user_id, dto);
  }

  @Patch('/c/password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updatePassword(@Request() request: any, @Body() dto: UpdateUserPasswordDto) {
    return this.userService.updatePassword(
      request.user.user_id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
