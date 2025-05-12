import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards';
import { HistoryService } from './history.service';
import { GetUserHistoryDto, LogMediaViewDto } from './dtos';

@ApiTags('History Log')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getUserHistory(@Request() req: any, @Query() dto: GetUserHistoryDto) {
    return this.historyService.getUserHistory(req.user.user_id, dto);
  }

  @Post('media/view')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logMediaAction(@Request() req: any, @Body() dto: LogMediaViewDto) {
    return this.historyService.logUserViewMedia(req.user.user_id, dto.media_id);
  }

  @Post('forum/view')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logForumAction() {}
}
