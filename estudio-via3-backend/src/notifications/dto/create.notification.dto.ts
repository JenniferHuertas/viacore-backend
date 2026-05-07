import { NotificationType } from '../enums/notifications-type.enum';

export class CreateNotificationDto {
  userId!: string;
  subject!: string;
  message!: string;
  type!: NotificationType;

  trainingRequestId?: string;
  meetingId?: string;
  paymentId?: string;
}