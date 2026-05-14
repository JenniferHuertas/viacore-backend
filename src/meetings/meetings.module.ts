import { Module } from '@nestjs/common';

import { MeetingsService } from './meetings.service';

import { MeetingsController } from './meetings.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Meetings } from './entities/meeting.entity';

import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

import { Users } from 'src/users/entities/user.entity';

import { EmailModule } from 'src/notifications/channels/email/email.module';

@Module({
  controllers: [
    MeetingsController,
  ],

  providers: [MeetingsService],

  imports: [
    TypeOrmModule.forFeature([
      Meetings,
      TrainingRequests,
      Users,
    ]),

    EmailModule,
  ],
})
export class MeetingsModule {}