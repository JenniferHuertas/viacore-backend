import { NotificationPayload } from '../interfaces/notification-payload.interface';
import { NotificationPriority } from '../enums/notification-priority.enum';

export const buildNotification = (
  payload: NotificationPayload,
): NotificationPayload => {
  return {
    ...payload,
    priority: payload.priority || NotificationPriority.MEDIUM,
    metadata: payload.metadata || {},
  };
};