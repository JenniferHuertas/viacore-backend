import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';

import { CalendlyService } from './calendly.service';

import { CalendlyController } from './calendly.controller';

@Module({
  imports: [
    // Configuración global del cliente HTTP
    // para conectarse automáticamente con Calendly.
    HttpModule.register({
      baseURL: 'https://api.calendly.com',

      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,

        'Content-Type': 'application/json',
      },
    }),
  ],

  // Controller encargado de:
  // - webhooks
  // - sincronización automática
  controllers: [CalendlyController],

  // Servicio principal de integración Calendly.
  providers: [CalendlyService],

  exports: [CalendlyService],
})
export class CalendlyModule {}