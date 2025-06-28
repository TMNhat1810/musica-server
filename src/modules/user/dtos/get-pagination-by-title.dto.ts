import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos';

export class GetPaginationByTitleDto extends PaginationDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  query: string;

  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  allowAll: boolean = false;
}
