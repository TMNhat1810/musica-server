import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class getGlobalStatisticsByGroup {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  @IsEnum(['day', 'week', 'month'])
  group: 'day' | 'week' | 'month';
}
