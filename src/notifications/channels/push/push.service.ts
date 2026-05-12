import { Injectable } from '@nestjs/common';

import * as admin from 'firebase-admin';

import { firebaseApp } from './firebase.config';

@Injectable()
export class PushService {
  private readonly messaging: admin.messaging.Messaging;

  constructor() {
    this.messaging =
      firebaseApp.messaging();
  }

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    return await this.messaging.send({
      token,

      notification: {
        title,
        body,
      },

      data,
    });
  }

  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    return await this.messaging.sendEachForMulticast({
      tokens,

      notification: {
        title,
        body,
      },

      data,
    });
  }
}