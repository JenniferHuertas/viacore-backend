import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notificatios.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsListener } from './listeners/notifications.listeners';

@Module({
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsListener,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}