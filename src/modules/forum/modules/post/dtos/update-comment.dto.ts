import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  new_content: string;
}
