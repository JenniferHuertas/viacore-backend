import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationPriority } from '../enums/notification-priority.enum';
import { NotificationType } from '../enums/notification-type.enum';

export interface NotificationPayload {
  userId: string;

  title: string;

  message: string;

  type: NotificationType;

  channels: NotificationChannel[];

  priority?: NotificationPriority;

  entityType?: string;

  entityId?: string;

  metadata?: Record<string, any>;
}