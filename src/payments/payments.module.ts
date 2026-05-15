import { Module } from '@nestjs/common';

import { PaymentsService } from './payments.service';

import { PaymentsController } from './payments.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from './entities/payment.entity';

import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

import { PaymentsRepository } from './payments.repository';

import { EmailModule } from 'src/notifications/channels/email/email.module';

import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      TrainingRequests,
    ]),

    EmailModule,

    NotificationsModule,
  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
    PaymentsRepository,
  ],
})
export class PaymentsModule {}