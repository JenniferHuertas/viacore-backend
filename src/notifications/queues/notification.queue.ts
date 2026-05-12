import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

import { NotificationJobs } from './notification.jobs';

@Injectable()
export class NotificationQueue {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
  ) {}

  async addEmailJob(
    data: any,
  ) {
    await this.notificationsQueue.add(
      NotificationJobs.SEND_EMAIL,
      data,
      {
        attempts: 3,

        backoff: {
          type: 'exponential',

          delay: 3000,
        },

        removeOnComplete: true,
      },
    );
  }

  async addPushJob(
    data: any,
  ) {
    await this.notificationsQueue.add(
      NotificationJobs.SEND_PUSH,
      data,
      {
        attempts: 3,

        backoff: {
          type: 'exponential',

          delay: 3000,
        },

        removeOnComplete: true,
      },
    );
  }

  async addSocketJob(
    data: any,
  ) {
    await this.notificationsQueue.add(
      NotificationJobs.SEND_SOCKET,
      data,
      {
        removeOnComplete: true,
      },
    );
  }
}