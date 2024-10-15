import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { Role } from 'src/user/enum/role.enum';
import { RolesGuard } from 'src/user/auth/roles.guard';
import { Roles } from 'src/user/auth/roles.decorator';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { User } from 'src/user/user.schema';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/general')
  async getGeneralNotification(
    @Query() notificationQuery: NotificationQueryDto,
  ) {
    return this.getGeneralNotification(notificationQuery);
  }

  @Get('/me')
  @UseGuards(AccessTokenGuard)
  async getUserNotification(
    @GetUser() user: User,
    @Query() notificationQuery: NotificationQueryDto,
  ) {
    return this.notificationService.getUserNofication(user, notificationQuery);
  }

  @Get('/admin')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  async getAdminNotification(@Query() notificationQuery: NotificationQueryDto) {
    return this.notificationService.getAdminNotification(notificationQuery);
  }

  @Patch('/read/:id')
  @UseGuards(AccessTokenGuard)
  async readUserNotification(@Param('id') id: string) {
    return this.notificationService.readUserNotification(id);
  }
}
