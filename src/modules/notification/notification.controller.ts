import {
  Controller,
  Delete,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteNotification() {}

  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async markAsRead(@Param('id') id: string, @Request() request: any) {
    return this.notificationService.markAsRead(id, request.user.user_id);
  }
}
