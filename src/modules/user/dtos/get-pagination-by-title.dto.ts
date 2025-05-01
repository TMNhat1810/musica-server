import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos';

export class GetPaginationByTitleDto extends PaginationDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  query: string;
}
