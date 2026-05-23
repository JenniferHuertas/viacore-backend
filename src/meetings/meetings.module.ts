import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';

import { Meetings } from './entities/meeting.entity';

import { CalendlyModule } from 'src/calendly/calendly.module';
import { TrainingRequestModule } from 'src/training-requests/training-request.module';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetings, TrainingRequests]),

    // Se importa CalendlyModule para poder utilizar
    // CalendlyService dentro del módulo de reuniones.
    CalendlyModule,
    TrainingRequestModule
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}