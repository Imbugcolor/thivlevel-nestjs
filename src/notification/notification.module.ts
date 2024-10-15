import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { UserNotificationModule } from './userNotification/userNotification.module';
import {
  UserNotification,
  UserNotificationSchema,
} from './userNotification/userNotification.shema';
import { NotificationController } from './notification.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: UserNotification.name, schema: UserNotificationSchema },
    ]),
    UserModule,
    UserNotificationModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
