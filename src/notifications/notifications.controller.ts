import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  async create(
    @Body()
    createNotificationDto: CreateNotificationDto,
  ) {
    return await this.notificationsService.create(
      createNotificationDto,
    );
  }

  @Post('send')
  async send(
    @Body()
    sendNotificationDto: SendNotificationDto,
  ) {
    return await this.notificationsService.send(
      sendNotificationDto,
    );
  }

  @Get('user/:userId')
  async findAllByUser(
    @Param('userId')
    userId: string,
  ) {
    return await this.notificationsService.findAllByUser(
      userId,
    );
  }

  @Get('user/:userId/unread')
  async findUnreadByUser(
    @Param('userId')
    userId: string,
  ) {
    return await this.notificationsService.findUnreadByUser(
      userId,
    );
  }

  @Get('user/:userId/count')
  async countUnread(
    @Param('userId')
    userId: string,
  ) {
    return await this.notificationsService.countUnread(
      userId,
    );
  }

  @Patch(':notificationId/read')
  async markAsRead(
    @Param('notificationId')
    notificationId: string,
  ) {
    return await this.notificationsService.markAsRead(
      notificationId,
    );
  }

  @Patch('user/:userId/read-all')
  async markAllAsRead(
    @Param('userId')
    userId: string,
  ) {
    return await this.notificationsService.markAllAsRead(
      userId,
    );
  }

  @Delete(':notificationId')
  async remove(
    @Param('notificationId')
    notificationId: string,
  ) {
    return await this.notificationsService.remove(
      notificationId,
    );
  }

  @Post('devices/register')
  async registerDevice(
    @Body()
    registerDeviceDto: RegisterDeviceDto,
  ) {
    return await this.notificationsService.registerDevice(
      registerDeviceDto,
    );
  }

  @Delete('devices/:token')
  async removeDevice(
    @Param('token')
    token: string,
  ) {
    return await this.notificationsService.removeDevice(
      token,
    );
  }

  @Get('devices/user/:userId')
  async getUserDevices(
    @Param('userId')
    userId: string,
  ) {
    return await this.notificationsService.getUserDevices(
      userId,
    );
  }
}