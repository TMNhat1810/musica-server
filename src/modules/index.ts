import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';

export const Modules = [AuthModule, UserModule, MediaModule, CloudinaryModule];
