import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';

import { Meetings } from './entities/meeting.entity';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';
import { Users } from 'src/users/entities/user.entity';

import { EmailModule } from 'src/notifications/channels/email/email.module';
import { CalendlyModule } from 'src/calendly/calendly.module';
import { TrainingRequestModule } from 'src/training-requests/training-request.module';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MeetingRemindersService } from './cron/meeting-reminders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetings, TrainingRequests, Users]),
    ScheduleModule.forRoot(),
    EmailModule,
    CalendlyModule,
    NotificationsModule,
    TrainingRequestModule
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingRemindersService],
})
export class MeetingsModule {}
