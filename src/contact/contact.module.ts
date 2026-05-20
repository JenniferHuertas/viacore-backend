import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ContactController } from './contact.controller';

import { ContactService } from './contact.service';

import { ContactMessage } from './entities/contact.entity';

import { NotificationsModule } from '../notifications/notifications.module';

import { Users } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactMessage,
      Users,
    ]),

    NotificationsModule,
  ],

  controllers: [
    ContactController,
  ],

  providers: [ContactService],
})
export class ContactModule {}