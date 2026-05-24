import { Injectable } from '@nestjs/common';

@Injectable()
export class ReminderService {
  async sendReminder(meeting: any) {
    console.log('Reminder sent:', meeting.id);
  }
}