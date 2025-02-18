import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommentModule } from './comment/comment.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';

export const Modules = [
  AuthModule,
  UserModule,
  MediaModule,
  CommentModule,
  CloudinaryModule,
];
