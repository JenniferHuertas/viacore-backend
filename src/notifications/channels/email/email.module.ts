import { Module } from '@nestjs/common';

import { MailerModule } from '@nestjs-modules/mailer';

import { join } from 'path';

import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,

        port: Number(process.env.MAIL_PORT),

        secure: false,

        auth: {
          user: process.env.MAIL_USER,

          pass: process.env.MAIL_PASSWORD,
        },
      },

      defaults: {
        from: `"Via3" <${process.env.MAIL_USER}>`,
      },

      template: {
        dir: join(
          process.cwd(),
          'src/notifications/channels/email/templates',
        ),

        options: {
          strict: true,
        },
      },
    }),
  ],

  providers: [EmailService],

  exports: [EmailService],
})
export class EmailModule {}