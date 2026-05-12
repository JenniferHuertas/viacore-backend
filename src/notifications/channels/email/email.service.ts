import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendWelcomeEmail(
    email: string,
    fullName: string,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Bienvenido a Via3',

      template: 'welcome',

      context: {
        fullName,
      },
    });

    
  }

  async sendLoginAlert(
    email: string,
    fullName: string,
    ipAddress?: string,
    device?: string,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Nuevo inicio de sesión',

      template: 'login-alert',

      context: {
        fullName,
        ipAddress,
        device,
      },
    });
  }

  async sendPaymentApproved(
    email: string,
    fullName: string,
    amount: number,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Pago aprobado',

      template: 'payment-approved',

      context: {
        fullName,
        amount,
      },
    });
  }

  async sendPaymentRefunded(
    email: string,
    fullName: string,
    amount: number,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Reembolso realizado',

      template: 'payment-refunded',

      context: {
        fullName,
        amount,
      },
    });
  }

  async sendPaymentFailed(
    email: string,
    fullName: string,
    amount: number,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Pago fallido',

      template: 'payment-failed',

      context: {
        fullName,
        amount,
      },
    });
  }
}