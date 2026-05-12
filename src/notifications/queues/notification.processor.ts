import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { EmailService } from '../channels/email/email.service';

import { PushService } from '../channels/push/push.service';

import { NotificationsGateway } from '../notifications.gateway';

import { NotificationJobs } from './notification.jobs';

@Processor('notifications')
export class NotificationProcessor
  extends WorkerHost
{
  constructor(
    private readonly emailService: EmailService,

    private readonly pushService: PushService,

    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(
    job: Job<any>,
  ): Promise<any> {
    switch (job.name) {
      case NotificationJobs.SEND_EMAIL:
        return this.handleEmail(job);

      case NotificationJobs.SEND_SOCKET:
        return this.handleSocket(job);

      case NotificationJobs.SEND_PUSH:
        return this.handlePush(job);

      default:
        return null;
    }
  }

  async handleEmail(
    job: Job<any>,
  ) {
    const data = job.data;

    switch (data.type) {
      case 'WELCOME':
        await this.emailService.sendWelcomeEmail(
          data.email,
          data.fullName,
        );
        break;

      case 'LOGIN_ALERT':
        await this.emailService.sendLoginAlert(
          data.email,
          data.fullName,
          data.ipAddress,
          data.device,
        );
        break;

      case 'PAYMENT_APPROVED':
        await this.emailService.sendPaymentApproved(
          data.email,
          data.fullName,
          data.amount,
        );
        break;

      case 'PAYMENT_REFUNDED':
        await this.emailService.sendPaymentRefunded(
          data.email,
          data.fullName,
          data.amount,
        );
        break;

      case 'PAYMENT_FAILED':
        await this.emailService.sendPaymentFailed(
          data.email,
          data.fullName,
          data.amount,
        );
        break;
    }
  }

  async handleSocket(
    job: Job<any>,
  ) {
    const data = job.data;

    await this.notificationsGateway.sendToUser(
      data.userId,
      'notification',
      data.notification,
    );
  }

  async handlePush(
    job: Job<any>,
  ) {
    const data = job.data;

    await this.pushService.sendMulticast(
      data.tokens,

      data.title,

      data.body,

      data.data,
    );
  }
}