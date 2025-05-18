import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  getGlobalStatisticsByGroup,
  GetMediaStatsDto,
  GetUserStatsDto,
} from './dtos';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService) {}

  @Get('media')
  async getMediaStatistics(@Query() dto: GetMediaStatsDto) {
    return this.statsService.getMediaStatistics(dto.id);
  }

  @Get('user')
  async getUserStatistics(@Query() dto: GetUserStatsDto) {
    return this.statsService.getUserStatistics(dto.id);
  }

  @Get('global')
  async getGlobalStatistics() {
    return this.statsService.getGlobalStatistics();
  }

  @Get('global/group')
  async getGroupedStatistics(@Query() dto: getGlobalStatisticsByGroup) {
    return this.statsService.getGroupedStatistics(dto.group);
  }
}
