import { Injectable } from '@nestjs/common';

import { NotificationsService } from '../notifications.service';

import { NotificationType } from '../enums/notification-type.enum';

import { EmailService } from '../channels/email/email.service';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,

    private readonly emailService: EmailService,
  ) {}

  async handleUserRegistered(
    userId: string,
    fullName: string,
    email: string,
  ) {
    await this.notificationsService.create({
      userId,

      title: 'Bienvenido',

      message: `Bienvenido ${fullName} a la plataforma`,

      type: NotificationType.USER_REGISTERED,
    });

    await this.emailService.sendWelcomeEmail(
      email,
      fullName,
    );
  }

  async handlePaymentApproved(
    userId: string,
    fullName: string,
    email: string,
    amount: number,
  ) {
    await this.notificationsService.create({
      userId,

      title: 'Pago aprobado',

      message: `Tu pago de $${amount} fue aprobado`,

      type: NotificationType.PAYMENT_APPROVED,
    });

    await this.emailService.sendPaymentApproved(
      email,
      fullName,
      amount,
    );
  }

  async handleMeetingCreated(
    userId: string,
    meetingDate: string,
  ) {
    await this.notificationsService.create({
      userId,

      title: 'Nueva reunión',

      message: `Se programó una reunión para ${meetingDate}`,

      type: NotificationType.MEETING_CREATED,
    });
  }

  async handleTrainingAccepted(
    userId: string,
  ) {
    await this.notificationsService.create({
      userId,

      title: 'Solicitud aceptada',

      message: `Tu solicitud fue aceptada`,

      type:
        NotificationType.REQUEST_CONFIRMED,
    });
  }

  async handleTrainingRejected(
    userId: string,
  ) {
    await this.notificationsService.create({
      userId,

      title: 'Solicitud rechazada',

      message: `Tu solicitud fue rechazada`,

      type:
        NotificationType.REQUEST_CANCELLED,
    });
  }
}