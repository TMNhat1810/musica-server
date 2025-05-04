import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards';
import { HistoryService } from './history.service';
import { LogMediaViewDto } from './dtos';

@ApiTags('History Log')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('log/media')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logMediaAction(@Request() req: any, @Body() dto: LogMediaViewDto) {
    return this.historyService.logUserViewMedia(req.user.user_id, dto.media_id);
  }

  @Post('log/forum')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logForumAction() {}
}
