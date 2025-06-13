import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommentModule } from './comment/comment.module';
import { ForumModule } from './forum/forum.module';
import { HistoryModule } from './history/history.module';
import { MediaModule } from './media/media.module';
import { NotificationModule } from './notification/notification.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UserModule } from './user/user.module';

export const Modules = [
  AuthModule,
  UserModule,
  MediaModule,
  CommentModule,
  ForumModule,
  HistoryModule,
  StatisticsModule,
  NotificationModule,
  CloudinaryModule,
];
