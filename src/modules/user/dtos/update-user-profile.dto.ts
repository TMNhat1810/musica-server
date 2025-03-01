import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  display_name: string;
}
