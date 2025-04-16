import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateMediaDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  description: string;
}
