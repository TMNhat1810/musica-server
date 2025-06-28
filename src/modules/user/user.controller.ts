import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import {
  GetPaginationByTitleDto,
  SearchUserDto,
  UpdateUserPasswordDto,
  UpdateUserProfileDto,
} from './dtos';
import { PaginationDto } from 'src/common/dtos';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async searchUsers(@Query() dto: SearchUserDto) {
    return this.userService.searchUsers(dto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get(':id/media')
  async getUserMedia(
    @Param('id') id: string,
    @Query() dto: GetPaginationByTitleDto,
  ) {
    return this.userService.getUserMedia(id, dto);
  }

  @Get(':id/post')
  async getUserForumPost(
    @Param('id') id: string,
    @Query() dto: GetPaginationByTitleDto,
  ) {
    return this.userService.getUserForumPost(id, dto);
  }

  @Get(':id/follow')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async checkUserFollowing(@Param('id') id: string, @Request() request: any) {
    return this.userService.checkUserFollowing(request.user.user_id, id);
  }

  @Post(':id/follow')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async followUser(@Param('id') id: string, @Request() request: any) {
    return this.userService.followUser(request.user.user_id, id);
  }

  @Delete(':id/follow')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async unfollowUser(@Param('id') id: string, @Request() request: any) {
    return this.userService.unfollowUser(request.user.user_id, id);
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

  @Get('/c/followee')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUserFollowees(@Request() request: any) {
    return this.userService.getUserFollowees(request.user.user_id);
  }

  @Get('/c/followee/media')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUserFollowMedias(
    @Request() request: any,
    @Query() dto: PaginationDto,
  ) {
    return this.userService.getUserFolloweesMedias(request.user.user_id, dto);
  }

  @Get('/c/notification')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUserNotifications(@Request() request: any) {
    return this.userService.getUserNotification(request.user.user_id);
  }

  @Get('/c/notification/unread')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUserUnreadNotification(@Request() request: any) {
    return this.userService.getUserUnreadNotification(request.user.user_id);
  }

  @Patch('/c/notification/read-all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async readAllUserNotification(@Request() request: any) {
    return this.userService.readAllUserNotification(request.user.user_id);
  }

  @Get('/c/liked')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUserLikedMedias(
    @Request() request: any,
    @Query() dto: PaginationDto,
  ) {
    return this.userService.getUserLikedMedias(
      request.user.user_id,
      dto.page,
      dto.limit,
    );
  }
}
