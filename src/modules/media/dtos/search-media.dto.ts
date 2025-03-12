import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchMediaDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  query: string;
}
