import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpModule } from '@nestjs/axios';

import { CalendlyService } from './calendly.service';

import { CalendlyController } from './calendly.controller';
import { Meetings } from 'src/meetings/entities/meeting.entity';
import { MeetingsModule } from 'src/meetings/meetings.module';
import { EmailModule } from 'src/notifications/channels/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetings]),
    // Configuración global del cliente HTTP
    // para conectarse automáticamente con Calendly.
    HttpModule.register({
      baseURL: 'https://api.calendly.com',

      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,

        'Content-Type': 'application/json',
      },
    }),
    EmailModule,
  ],

  controllers: [
    CalendlyController,
  ],

  // Servicio principal de integración Calendly.
  providers: [CalendlyService],

  exports: [CalendlyService],
})
export class CalendlyModule {}