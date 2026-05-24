import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule';

import { Meetings } from './entities/meeting.entity';

import { MeetingsController } from './controllers/meetings.controller';

import { MeetingsService } from './services/meetings.service';

import { AvailabilityService } from './services/availability.service';

import { GoogleMeetService } from './services/google-meet.service';

import { ReminderService } from './services/reminder.service';

import { CalendarService } from './services/calendar.service';

import { MeetingRemindersService } from './cron/reminder.cron';

import { Users } from 'src/users/entities/user.entity';

import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetings, Users, TrainingRequests]),
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
    MeetingRemindersService,
  ],

  exports: [
    MeetingsService,
  ],
})
export class MeetingsModule {}