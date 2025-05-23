import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos';

export class SearchUserDto extends PaginationDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  query: string = '';
}
