import { Injectable } from '@nestjs/common';

import { OnEvent } from '@nestjs/event-emitter';

import { NotificationsService } from '../notifications.service';

import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationPriority } from '../enums/notification-priority.enum';
import { NotificationType } from '../enums/notification-type.enum';

import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserLoggedInEvent } from '../events/user-logged-in.event';
import { PaymentApprovedEvent } from '../events/payment-approved.event';
import { PaymentRefundedEvent } from '../events/payment-refunded.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { MeetingCreatedEvent } from '../events/meeting-created.event';
import { ChatMessageEvent } from '../events/chat-message.event';
import { TrainingRequestEvent } from '../events/training-request.event';
import { EmailService } from '../channels/email/email.service';


@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(
    event: UserRegisteredEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Bienvenido',

      message: `Bienvenido ${event.fullName} a la plataforma`,

      type: NotificationType.USER_REGISTERED,

      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.HIGH,

      metadata: {
        email: event.email,
      },
    });

    await this.emailService.sendWelcomeEmail(
    event.email,
      event.fullName
    );
  }

  @OnEvent('user.logged_in')
  async handleUserLoggedIn(
    event: UserLoggedInEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Nuevo inicio de sesión',

      message: `Se detectó un nuevo inicio de sesión`,

      type: NotificationType.USER_LOGGED_IN,

      channels: [
        NotificationChannel.EMAIL,
      ],

      priority: NotificationPriority.HIGH,

      metadata: {
        email: event.email,
        ipAddress: event.ipAddress,
        device: event.device,
      },
    });

    await this.emailService.sendLoginAlert(
      event.email,
      event.fullName,
      event.ipAddress,
      event.device,
    );
  }

  @OnEvent('payment.approved')
  async handlePaymentApproved(
    event: PaymentApprovedEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Pago aprobado',

      message: `Tu pago de $${event.amount} fue aprobado`,

      type: NotificationType.PAYMENT_APPROVED,

      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.URGENT,

      entityType: 'PAYMENT',

      entityId: event.paymentId,

      metadata: {
        amount: event.amount,
        email: event.email,
      },
    });
    await this.emailService.sendPaymentApproved(
    event.email,
    event.fullName,
    event.amount,
    );
  }

  @OnEvent('payment.refunded')
  async handlePaymentRefunded(
    event: PaymentRefundedEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Reembolso realizado',

      message: `Tu reembolso de $${event.amount} fue procesado`,

      type: NotificationType.PAYMENT_REFUNDED,

      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.HIGH,

      entityType: 'PAYMENT',

      entityId: event.paymentId,

      metadata: {
        amount: event.amount,
      },
    });

    await this.emailService.sendPaymentRefunded(
    event.email,
      event.fullName,
      event.amount
    );
  }

  @OnEvent('payment.failed')
  async handlePaymentFailed(
    event: PaymentFailedEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Pago fallido',

      message: `Tu pago de $${event.amount} falló`,

      type: NotificationType.PAYMENT_FAILED,

      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.URGENT,

      entityType: 'PAYMENT',

      entityId: event.paymentId,
    });
    await this.emailService.sendPaymentFailed(
    event.email,
    event.fullName,
    event.amount
    );
  }

  @OnEvent('meeting.created')
  async handleMeetingCreated(
    event: MeetingCreatedEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Nueva reunión',

      message: `Se programó una reunión para ${event.meetingDate}`,

      type: NotificationType.MEETING_CREATED,

      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.HIGH,

      entityType: 'MEETING',

      entityId: event.meetingId,

      metadata: {
        meetingLink: event.meetingLink,
      },
    });
  }

  @OnEvent('chat.message.received')
  async handleChatMessage(
    event: ChatMessageEvent,
  ) {
    await this.notificationsService.send({
      userId: event.receiverId,

      title: 'Nuevo mensaje',

      message: `${event.senderName} te envió un mensaje`,

      type:
        NotificationType.CHAT_MESSAGE_RECEIVED,

      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.MEDIUM,

      metadata: {
        senderId: event.senderId,
      },
    });
  }

  @OnEvent('training_request.accepted')
  async handleTrainingAccepted(
    event: TrainingRequestEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Solicitud aceptada',

      message: `Tu solicitud fue aceptada`,

      type:
        NotificationType.TRAINING_REQUEST_ACCEPTED,

      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.HIGH,

      entityType: 'TRAINING_REQUEST',

      entityId: event.trainingRequestId,
    });
  }

  @OnEvent('training_request.rejected')
  async handleTrainingRejected(
    event: TrainingRequestEvent,
  ) {
    await this.notificationsService.send({
      userId: event.userId,

      title: 'Solicitud rechazada',

      message: `Tu solicitud fue rechazada`,

      type:
        NotificationType.TRAINING_REQUEST_REJECTED,

      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],

      priority: NotificationPriority.HIGH,

      entityType: 'TRAINING_REQUEST',

      entityId: event.trainingRequestId,
    });
  }
}