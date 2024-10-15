import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/user.schema';
import { UserNotificationStatus } from '../enum/notificaton.enum';
import { Notification } from '../notification.schema';
import { Expose } from 'class-transformer';

@Schema({ timestamps: true })
export class UserNotification {
  constructor(partial: Partial<UserNotification>) {
    Object.assign(this, partial);
  }
  @Prop({ type: mongoose.Types.ObjectId, ref: User.name, required: true })
  @Expose()
  user: User;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: Notification.name,
    required: true,
  })
  @Expose()
  notification: Notification;

  @Prop({ default: UserNotificationStatus.UNREAD })
  @Expose()
  status: UserNotificationStatus;

  @Prop({ type: Date, default: null })
  @Expose()
  read_at: Date | null;
}

export const UserNotificationSchema =
  SchemaFactory.createForClass(UserNotification);
