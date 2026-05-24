import { Injectable } from '@nestjs/common';
import { createEvent } from 'ics';

@Injectable()
export class CalendarService {
  async generateICS(meeting: any): Promise<string> {
    return new Promise((resolve, reject) => {
      createEvent(
        {
          title: meeting.topic,
          start: [
            meeting.startTime.getFullYear(),
            meeting.startTime.getMonth() + 1,
            meeting.startTime.getDate(),
            meeting.startTime.getHours(),
            meeting.startTime.getMinutes(),
          ],
          duration: {
            minutes: 30,
          },
          organizer: {
            name: 'Meetings',
            email: 'noreply@example.com',
          },
          attendees: [
            {
              name: meeting.userName,
              email: meeting.userEmail,
            },
          ],
        },
        (error, value) => {
          if (error) {
            reject(error);
          }

          resolve(value);
        },
      );
    });
  }
}