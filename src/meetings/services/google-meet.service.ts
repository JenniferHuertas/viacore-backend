import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleMeetService {
  private oauth2Client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>(
        'GOOGLE_MEET_CLIENT_ID',
      ),

      this.configService.get<string>(
        'GOOGLE_MEET_CLIENT_SECRET',
      ),

      'http://localhost',
    );

    this.oauth2Client.setCredentials({
      refresh_token:
        this.configService.get<string>(
          'GOOGLE_MEET_REFRESH_TOKEN',
        ),
    });
  }

  async createEvent(data: {
    start: Date;
    end: Date;
    email: string;
    name: string;
  }) {
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    const response =
      await calendar.events.insert({
        calendarId: 'primary',

        conferenceDataVersion: 1,

        sendUpdates: 'all',

        requestBody: {
          summary: 'Scheduled Meeting',

          description:
            'Meeting created automatically from the platform.',

          start: {
            dateTime:
              data.start.toISOString(),

            timeZone:
              'America/Bogota',
          },

          end: {
            dateTime:
              data.end.toISOString(),

            timeZone:
              'America/Bogota',
          },

          attendees: [
            {
              email: data.email,
              displayName: data.name,
            },
          ],

          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,

              conferenceSolutionKey: {
                type:
                  'hangoutsMeet',
              },
            },
          },
        },
      });

    const meetLink =
      response.data.conferenceData?.entryPoints?.find(
        (entry) =>
          entry.entryPointType ===
          'video',
      )?.uri || '';

    return {
      meetLink,

      googleEventId:
        response.data.id || '',
    };
  }

  async deleteEvent(
    eventId: string,
  ) {
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });

    return {
      deleted: true,
    };
  }

  async updateEvent(
    eventId: string,
    start: Date,
    end: Date,
  ) {
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    await calendar.events.patch({
      calendarId: 'primary',

      eventId,

      sendUpdates: 'all',

      requestBody: {
        start: {
          dateTime:
            start.toISOString(),

          timeZone:
            'America/Bogota',
        },

        end: {
          dateTime:
            end.toISOString(),

          timeZone:
            'America/Bogota',
        },
      },
    });

    return {
      updated: true,
    };
  }
}