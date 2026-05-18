import { Injectable } from '@nestjs/common';

import axios from 'axios';

import * as handlebars from 'handlebars';

import * as fs from 'fs';

import * as path from 'path';

@Injectable()
export class EmailService {
  private compileTemplate(
    templateName: string,
    context: Record<string, any>,
  ): string {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );

    const source = fs.readFileSync(
      templatePath,
      'utf8',
    );

    const template =
      handlebars.compile(source);

    return template(context);
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ) {
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'ViaCore',

            email:
              'danielmauriciomedina95@gmail.com',
          },

          to: [{ email: to }],

          subject,

          htmlContent,
        },
        {
          headers: {
            'api-key':
              process.env.BREVO_API_KEY,

            'Content-Type':
              'application/json',
          },
        },
      );

      console.log(
        `EMAIL ENVIADO A ${to}`,
      );
    } catch (error: any) {
      console.error(
        'ERROR ENVIANDO EMAIL',
        error.response?.data ||
          error.message,
      );
    }
  }

  async sendWelcomeEmail(
    email: string,
    fullName: string,
  ) {
    const html =
      this.compileTemplate(
        'welcome',
        {
          fullName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Bienvenido a ViaCore',
      html,
    );
  }

  async sendPaymentApproved(
    email: string,
    fullName: string,
    amount: number,
  ) {
    const html =
      this.compileTemplate(
        'payment-approved',
        {
          fullName,
          amount,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Pago aprobado',
      html,
    );
  }

  async sendTrainingRequestCreated(
    email: string,
    companyName: string,
  ) {
    const html =
      this.compileTemplate(
        'training-request-created',
        {
          companyName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Nueva solicitud de capacitación',
      html,
    );
  }

  async sendMeetingCreated(
    email: string,
    companyName: string,
    meetingDate: string,
    meetingLink: string,
  ) {
    const html = this.compileTemplate('meeting-created', {
      companyName,
      meetingDate,
      meetingLink,
      platformUrl: process.env.PLATFORM_URL ??'https://estudio-via3-frontend.vercel.app/',
      year:new Date().getFullYear(),
    });
    await this.sendEmail(email, 'Reunión agendada', html);
  }

  async sendContactConfirmation(
    email: string,
    nombre: string,
  ) {
    const html = this.compileTemplate('contact-confirmation', {
      nombre,
      platformUrl: process.env.PLATFORM_URL ?? 'https://estudio-via3-frontend.vercel.app/',
      year: new Date().getFullYear(),
    });
    await this.sendEmail(email, 'Recibimos tu consulta', html);
  }

  async sendTrainingInReview(
    email: string,
    companyName: string,
  ) {
    const html =
      this.compileTemplate(
        'training-in-review',
        {
          companyName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Solicitud en revisión',
      html,
    );
  }

  async sendTrainingAwaitingPayment(
    email: string,
    companyName: string,
  ) {
    const html =
      this.compileTemplate(
        'training-awaiting-payment',
        {
          companyName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Pago pendiente',
      html,
    );
  }

  async sendTrainingScheduled(
    email: string,
    companyName: string,
  ) {
    const html =
      this.compileTemplate(
        'training-scheduled',
        {
          companyName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Capacitación agendada',
      html,
    );
  }

  async sendTrainingConfirmed(
    email: string,
    companyName: string,
  ) {
    const html =
      this.compileTemplate(
        'training-confirmed',
        {
          companyName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Capacitación confirmada',
      html,
    );
  }

  async sendTrainingCancelled(
    email: string,
    companyName: string,
  ) {
    const html =
      this.compileTemplate(
        'training-cancelled',
        {
          companyName,

          platformUrl:
            process.env.PLATFORM_URL ??
            'https://estudio-via3-frontend.vercel.app/',

          year:
            new Date().getFullYear(),
        },
      );

    await this.sendEmail(
      email,
      'Solicitud cancelada',
      html,
    );
  }
}
