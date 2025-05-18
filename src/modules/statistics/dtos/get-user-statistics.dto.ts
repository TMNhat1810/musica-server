import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetUserStatsDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  id: string;
}
