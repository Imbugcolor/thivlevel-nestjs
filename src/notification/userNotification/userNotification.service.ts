import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserNotification } from './userNotification.shema';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { Notification } from '../notification.schema';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectModel(UserNotification.name)
    private userNotificationModel: Model<UserNotification>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async createUserNotification(userId: string, notification: Notification) {
    const user = await this.userModel.findById(userId);
    const userNotification = new UserNotification({
      user,
      notification,
    });
    return (
      await this.userNotificationModel.create(userNotification)
    ).toObject();
  }
}
