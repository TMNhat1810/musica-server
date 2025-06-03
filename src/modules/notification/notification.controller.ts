import { Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async markAsRead() {}
}
