import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule';

import { Meeting } from './entities/meeting.entity';

import { MeetingsController } from './controllers/meetings.controller';

import { MeetingsService } from './services/meetings.service';

import { AvailabilityService } from './services/availability.service';

import { GoogleMeetService } from './services/google-meet.service';

import { ReminderService } from './services/reminder.service';

import { CalendarService } from './services/calendar.service';

import { ReminderCron } from './cron/reminder.cron';

import { TrainingRequests } from '../training-request/entities/training-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      TrainingRequests,
    ]),

    ScheduleModule.forRoot(),
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
    ReminderCron,
  ],

  exports: [
    MeetingsService,
  ],
})
export class MeetingsModule {}