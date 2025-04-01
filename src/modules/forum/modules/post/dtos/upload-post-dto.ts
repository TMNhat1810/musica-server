import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UploadPostFilesDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  images?: Express.Multer.File[];
}
