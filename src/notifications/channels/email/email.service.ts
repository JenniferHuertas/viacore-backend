import { Injectable } from '@nestjs/common';

import axios from 'axios';

@Injectable()
export class EmailService {
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

          to: [
            {
              email: to,
            },
          ],

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
    await this.sendEmail(
      email,

      'Bienvenido a ViaCore',

      `
      <h1>
        Bienvenido a ViaCore ${fullName}
      </h1>

      <p>
        Tu cuenta fue creada exitosamente.
      </p>

      <p>
        Gracias por confiar en ViaCore.
      </p>
      `,
    );
  }

  async sendPaymentApproved(
    email: string,
    fullName: string,
    amount: number,
  ) {
    await this.sendEmail(
      email,

      'Pago aprobado',

      `
      <h1>
        Hola ${fullName}
      </h1>

      <p>
        Tu pago de $${amount}
        fue aprobado correctamente.
      </p>
      `,
    );
  }

  async sendTrainingRequestCreated(
    email: string,
    companyName: string,
  ) {
    await this.sendEmail(
      email,

      'Nueva solicitud de capacitación',

      `
      <h1>
        Solicitud recibida
      </h1>

      <p>
        La solicitud para
        ${companyName}
        fue creada correctamente.
      </p>
      `,
    );
  }

  async sendMeetingCreated(
    email: string,
    companyName: string,
    meetingDate: string,
  ) {
    await this.sendEmail(
      email,

      'Reunión agendada',

      `
      <h1>
        Reunión confirmada
      </h1>

      <p>
        Empresa:
        ${companyName}
      </p>

      <p>
        Fecha:
        ${meetingDate}
      </p>
      `,
    );
  }
}