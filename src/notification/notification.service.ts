import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './notification.schema';
import { Model } from 'mongoose';
import {
  NotificationType,
  UserNotificationStatus,
} from './enum/notificaton.enum';
import { UserNotificationService } from './userNotification/userNotification.service';
import { UserNotification } from './userNotification/userNotification.shema';
import { User } from 'src/user/user.schema';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { Paginator } from 'src/utils/Paginator';

@Injectable()
export class NotificationService {
  private userNotificationPaginator: Paginator<UserNotification>;
  private notificationPaginator: Paginator<Notification>;
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(UserNotification.name)
    private userNotificationModel: Model<UserNotification>,
    private userNotificationService: UserNotificationService,
  ) {
    this.userNotificationPaginator = new Paginator<UserNotification>(
      this.userNotificationModel,
    );
    this.notificationPaginator = new Paginator<Notification>(
      this.notificationModel,
    );
  }

  async createGeneralNotification({
    title,
    message,
    variables,
    target_url,
  }: {
    title: string;
    message: string;
    variables?: string;
    target_url?: string;
  }) {
    const newNotification = new Notification({
      title,
      message,
      type: NotificationType.GENERAL,
      variables,
      target_url,
    });
    return (await this.notificationModel.create(newNotification)).toObject();
  }

  async createNotification({
    receiver,
    title,
    message,
    type,
    variables,
    image_url,
    target_url,
  }: {
    receiver: string;
    title: string;
    message: string;
    type: NotificationType;
    variables?: string;
    image_url?: string;
    target_url?: string;
  }) {
    const newNotification = new Notification({
      title,
      message,
      type,
      variables,
      image_url,
      target_url,
    });
    await this.notificationModel.create(newNotification);
    const userNotification =
      await this.userNotificationService.createUserNotification(
        receiver,
        newNotification,
      );
    return userNotification;
  }

  async createAdminNotification({
    title,
    message,
    variables,
    image_url,
    target_url,
  }: {
    title: string;
    message: string;
    variables?: string;
    image_url?: string;
    target_url?: string;
  }) {
    const newNotification = new Notification({
      title,
      message,
      type: NotificationType.ORDER,
      variables,
      image_url,
      target_url,
      private: true,
    });
    return (await this.notificationModel.create(newNotification)).toObject();
  }

  async getGeneralNotification(query: NotificationQueryDto) {
    const { limit, page, sort } = query;

    return this.userNotificationPaginator.paginate(
      { type: NotificationType.GENERAL },
      {
        limit,
        page,
        sort,
      },
    );
  }

  async getUserNofication(user: User, query: NotificationQueryDto) {
    const { limit, page, sort } = query;

    return this.userNotificationPaginator.paginate(
      { user: user._id },
      {
        limit,
        page,
        sort,
      },
    );
  }

  async getAdminNotification(query: NotificationQueryDto) {
    const { limit, page, sort } = query;

    return this.notificationPaginator.paginate(
      { private: true },
      {
        limit,
        page,
        sort,
      },
    );
  }

  async readUserNotification(id: string) {
    return await this.userNotificationModel
      .findByIdAndUpdate(id, {
        status: UserNotificationStatus.READ,
        read_at: new Date(),
      })
      .lean();
  }
}
