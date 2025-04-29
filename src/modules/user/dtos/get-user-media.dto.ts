import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos';

export class GetUserMedia extends PaginationDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsOptional()
  query: string;
}
