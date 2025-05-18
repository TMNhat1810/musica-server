import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetMediaStatsDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  id: string;
}
