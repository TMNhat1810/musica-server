import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  type: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  content: string;

  @ApiProperty({
    type: [String],
    required: true,
    isArray: true,
  })
  @Transform(({ value }) => JSON.parse(value))
  @IsArray()
  @IsString({ each: true })
  deleteIds: string[];
}
