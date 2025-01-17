import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  refresh_token: string;
}
