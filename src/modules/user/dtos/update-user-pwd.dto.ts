import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  newPassword: string;
}
