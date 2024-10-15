import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../notification.schema';
import { User, UserSchema } from 'src/user/user.schema';
import {
  UserNotification,
  UserNotificationSchema,
} from './userNotification.shema';
import { UserNotificationService } from './userNotification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserNotification.name, schema: UserNotificationSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [UserNotificationService],
  exports: [UserNotificationService],
})
export class UserNotificationModule {}
