import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class GetRecommendMediasDto {
  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number = 10;

  @ApiProperty({ type: 'string', required: true })
  @IsOptional()
  @IsString()
  from_id: string;
}
