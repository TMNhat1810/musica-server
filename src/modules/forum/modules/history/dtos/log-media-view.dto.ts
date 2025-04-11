import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogMediaViewDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  media_id: string;
}
