import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../database/services';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [],
  providers: [UserService, PrismaService, CloudinaryService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
