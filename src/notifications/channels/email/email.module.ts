import { Module } from '@nestjs/common';

import { MailerModule } from '@nestjs-modules/mailer';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { join } from 'path';

import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,

          port: Number(
            process.env.MAIL_PORT,
          ),

          secure: false,

          ignoreTLS: true,

          connectionTimeout: 10000,

          auth: {
            user: process.env.MAIL_USER,

            pass:
              process.env.MAIL_PASSWORD,
          },
        },

        verifyTransporters: false,

        defaults: {
          from: `"ViaCore" <${process.env.MAIL_USER}>`,
        },

        template: {
          dir: join(
            process.cwd(),

            process.env.NODE_ENV ===
              'production'
              ? 'dist/templates'
              : 'src/notifications/channels/email/templates',
          ),

          adapter:
            new HandlebarsAdapter(),

          options: {
            strict: true,
          },
        },
      }),
    }),
  ],

  providers: [EmailService],

  exports: [EmailService],
})
export class EmailModule {}