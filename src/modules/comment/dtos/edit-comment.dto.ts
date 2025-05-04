import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditCommentDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  content: string;

  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  forum: boolean;
}
