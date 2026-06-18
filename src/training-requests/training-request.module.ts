import { Module } from '@nestjs/common';

import { TrainingRequestService } from './training-request.service';

import { TrainingRequestController } from './training-request.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainingRequests } from './entities/training-request.entity';

import { TrainingRequestRepository } from './repositories/training-request.repository';

import { FileResourceModule } from 'src/file-resource/file-resource.module';

import { Users } from 'src/users/entities/user.entity';

import { EmailModule } from 'src/notifications/channels/email/email.module';

import { NotificationsModule } from 'src/notifications/notifications.module';
import { Training } from 'src/training/entities/training.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingRequests, Users, Training]),

    FileResourceModule,

    EmailModule,

    NotificationsModule,
  ],

  controllers: [TrainingRequestController],

  providers: [TrainingRequestService, TrainingRequestRepository],

  exports: [TrainingRequestService],
})
export class TrainingRequestModule {}
