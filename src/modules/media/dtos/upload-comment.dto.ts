import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadCommentDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  content: string;
}
