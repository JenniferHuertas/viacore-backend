import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

import { Notification } from './entities/notification.entity';
import { DeviceToken } from './entities/device-token.entity';

import { NotificationsListener } from './listeners/notifications.listener';

import { EmailModule } from './channels/email/email.module';

import { BullModule } from '@nestjs/bullmq';
import { NotificationQueue } from './queues/notification.queue';
import { NotificationProcessor } from './queues/notification.processor';

import { PushModule } from './channels/push/push.module';

import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forFeature([
      Notification,
      DeviceToken,
    ]),
    EmailModule,
    PushModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],

  controllers: [
    NotificationsController,
  ],

  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsListener,
    NotificationQueue,
    NotificationProcessor,
    WsJwtGuard,
  ],

  exports: [
    NotificationsService,
    NotificationsGateway,
  ],
})
export class NotificationsModule {}