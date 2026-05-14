import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CalendlyService } from './calendly.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.calendly.com',
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }),
  ],
  providers: [CalendlyService],
  exports: [CalendlyService],
})
export class CalendlyModule {}