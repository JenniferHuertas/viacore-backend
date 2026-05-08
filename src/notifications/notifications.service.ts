import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notificatios.gateway';
import { CreateNotificationDto } from './dto/create.notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly gateway: NotificationsGateway,
  ) {}

  async createNotification(data: CreateNotificationDto) {
    const notification = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.gateway.sendToUser(data.userId, notification);

    return notification;
  }

  async findByUser(userId: string) {
    return []; // reemplaza con BD
  }

  async markAsRead(id: string) {
    return { id, status: 'READ' };
  }
}