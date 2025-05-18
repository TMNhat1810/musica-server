import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UploadMediaViewDto {
  @ApiProperty({
    type: 'number',
  })
  @IsInt()
  watched_seconds: number;
}
