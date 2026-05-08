import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../enums/notifications-type.enum';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('training.request.created')
  handleTrainingCreated(payload: any) {
    this.notificationsService.createNotification({
      userId: payload.userId,
      subject: 'Nueva solicitud de entrenamiento',
      message: 'Has creado una nueva solicitud',
      type: NotificationType.TRAINING_CREATED,
    });
  }

  @OnEvent('meeting.created')
  handleMeetingCreated(payload: any) {
    this.notificationsService.createNotification({
      userId: payload.userId,
      subject: 'Nueva reunión',
      message: 'Se ha programado una reunión',
      type: NotificationType.MEETING_CREATED,
    });
  }

  @OnEvent('payment.completed')
  handlePayment(payload: any) {
    this.notificationsService.createNotification({
      userId: payload.userId,
      subject: 'Pago recibido',
      message: 'Tu pago fue exitoso',
      type: NotificationType.PAYMENT_RECEIVED,
    });
  }
}