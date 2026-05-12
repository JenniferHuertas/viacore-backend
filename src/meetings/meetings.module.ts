import { Module } from '@nestjs/common';

import { MeetingsService } from './meetings.service';

import { MeetingsController } from './meetings.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Meetings } from './entities/meeting.entity';

import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

@Module({
  controllers: [
    MeetingsController,
  ],

  providers: [MeetingsService],

  imports: [
    TypeOrmModule.forFeature(
      [
        Meetings,
        TrainingRequests,
      ],
    ),
  ],
})
export class MeetingsModule {}