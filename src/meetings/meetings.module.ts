import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';

import { Meetings } from './entities/meeting.entity';

import { CalendlyModule } from 'src/calendly/calendly.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetings]),

    // Se importa CalendlyModule para poder utilizar
    // CalendlyService dentro del módulo de reuniones.
    CalendlyModule,
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}