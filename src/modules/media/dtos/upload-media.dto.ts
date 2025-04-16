import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'integer',
    required: true,
  })
  @Type(() => Number)
  @IsInt()
  duration: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
  })
  media: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;
}
