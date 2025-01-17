import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  username: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  password: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  display_name: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  email: string;
}
