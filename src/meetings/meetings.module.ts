import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { Meetings } from './entities/meeting.entity';

import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

import { Users } from 'src/users/entities/user.entity';

import { MeetingsService } from './services/meetings.service';

import { AvailabilityService } from './services/availability.service';

import { GoogleMeetService } from './services/google-meet.service';

import { MeetingRemindersService } from './cron/reminder.cron';

import { TrainingRequestModule } from 'src/training-requests/training-request.module';

import { EmailModule } from 'src/notifications/channels/email/email.module';

import { NotificationsModule } from 'src/notifications/notifications.module';

import { MeetingsController } from './controllers/meetings.controller';

import { ReminderService } from './services/reminder.service';

import { CalendarService } from './services/calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetings, Users, TrainingRequests]),
    ScheduleModule.forRoot(),
    EmailModule,
    NotificationsModule,
    TrainingRequestModule,
  ],

  controllers: [
    MeetingsController,
  ],

  providers: [
    MeetingsService,
    AvailabilityService,
    GoogleMeetService,
    ReminderService,
    CalendarService,
    MeetingRemindersService,
  ],

  exports: [
    MeetingsService,
  ],
})
export class MeetingsModule {}
