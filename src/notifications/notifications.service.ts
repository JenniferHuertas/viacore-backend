import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Notification } from './entities/notification.entity';
import { DeviceToken } from './entities/device-token.entity';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';

import { NotificationStatus } from './enums/notification-status.enum';

import { NotificationsGateway } from './notifications.gateway';

import { NotificationQueue } from './queues/notification.queue';


@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,

    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification =
      this.notificationRepository.create(
        createNotificationDto,
      );

    return await this.notificationRepository.save(
      notification,
    );
  }



async send(
  sendNotificationDto: SendNotificationDto,
): Promise<Notification> {
  const notification =
    await this.create(
      sendNotificationDto,
    );

  await this.notificationQueue.addSocketJob({
    userId: notification.userId,

    notification,
  });

  const devices =
    await this.getUserDevices(
      notification.userId,
    );

  const tokens = devices.map(
    (device) => device.token,
  );

  if (tokens.length > 0) {
    await this.notificationQueue.addPushJob({
      tokens,

      title: notification.title,

      body: notification.message,

      data: {
        notificationId: notification.id,
        type: notification.type,
      },
    });
  }

  return notification;
}




  async findAllByUser(
    userId: string,
  ): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findUnreadByUser(
    userId: string,
  ): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async countUnread(
    userId: string,
  ): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async markAsRead(
    notificationId: string,
  ): Promise<Notification> {
    const notification =
      await this.notificationRepository.findOne({
        where: {
          id: notificationId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    notification.isRead = true;

    notification.status =
      NotificationStatus.READ;

    notification.readAt = new Date();

    return await this.notificationRepository.save(
      notification,
    );
  }

  async markAllAsRead(
    userId: string,
  ): Promise<void> {
    await this.notificationRepository.update(
      {
        userId,
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async remove(
    notificationId: string,
  ): Promise<void> {
    const notification =
      await this.notificationRepository.findOne({
        where: {
          id: notificationId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    await this.notificationRepository.remove(
      notification,
    );
  }

  async registerDevice(
    registerDeviceDto: RegisterDeviceDto,
  ): Promise<DeviceToken> {
    const existingToken =
      await this.deviceTokenRepository.findOne({
        where: {
          token: registerDeviceDto.token,
        },
      });

    if (existingToken) {
      existingToken.lastUsedAt =
        new Date();

      existingToken.isActive = true;

      return await this.deviceTokenRepository.save(
        existingToken,
      );
    }

    const device =
      this.deviceTokenRepository.create({
        ...registerDeviceDto,
        lastUsedAt: new Date(),
      });

    return await this.deviceTokenRepository.save(
      device,
    );
  }

  async removeDevice(
    token: string,
  ): Promise<void> {
    await this.deviceTokenRepository.delete({
      token,
    });
  }

  async getUserDevices(
    userId: string,
  ): Promise<DeviceToken[]> {
    return await this.deviceTokenRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });
  }
}