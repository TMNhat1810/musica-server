import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class DeleteCommentDto {
  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  forum: boolean;
}
