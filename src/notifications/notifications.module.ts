import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsController } from './notifications.controller';

import { NotificationsService } from './notifications.service';

import { Notification } from './entities/notification.entity';

import { NotificationsGateway } from './gateways/notifications.gateway';

import { EmailService } from './channels/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],

  controllers: [NotificationsController],

  providers: [NotificationsService, NotificationsGateway, EmailService],

  exports: [NotificationsService, NotificationsGateway, EmailService],
})
export class NotificationsModule {}
