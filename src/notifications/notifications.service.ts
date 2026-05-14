import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';

import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
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
        isRead: false,
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
        isRead: false,
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
        isRead: false,
      },
      {
        isRead: true,
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
}