import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

export interface CreateOneOffEventDto {
  name: string;

  startTime: string;

  endTime: string;

  guestEmail: string;

  guestName: string;
}

import { Repository } from 'typeorm';

import { Meetings } from '../meetings/entities/meeting.entity';
import { MeetingStatus } from 'src/meetings/entities/meetingStatus.entity';

@Injectable()
export class CalendlyService {
  private readonly logger = new Logger(CalendlyService.name);

  // Se cachea el user URI para evitar solicitarlo
  // en cada request a la API de Calendly.
  private userUri: string | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly meetingsRepository: Repository<Meetings>
  ) {}

  // Se obtiene automáticamente el user URI desde Calendly.
  // Esto evita depender de variables manuales en .env.
  async getCurrentUserUri(): Promise<string> {
    if (this.userUri) {
      return this.userUri;
    }

    const { data } = await firstValueFrom(
      this.httpService.get('/users/me'),
    );

    this.userUri = data.resource.uri;

    return this.userUri!;
  }

  async createOneOffEvent(dto: CreateOneOffEventDto): Promise<any> {
    try {
      const userUri = await this.getCurrentUserUri();

      // Calendly requiere duración y configuración de fecha
      // para crear eventos dinámicos tipo one-off.
      const payload = {
        name: dto.name,

        host: userUri,

        duration: 30,

        date_setting: {
          type: 'date_range',

          start_date: dto.startTime.split('T')[0],

          end_date: dto.endTime.split('T')[0],
        },

        end_time: dto.endTime,

        // Temporalmente usamos Zoom integrado automáticamente.
        location: {
          kind: 'zoom_conference',
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post('/one_off_event_types', payload),
      );

      this.logger.log(
        `Scheduling URL creada: ${data.resource?.scheduling_url}`,
      );

      return data.resource;
    } catch (error: any) {
      this.logger.error(
        error?.response?.data || error.message,
      );

      throw new InternalServerErrorException(
        'Error al crear evento en Calendly',
      );
    }
  }

  // Se deja preparado el manejo de webhooks para futuras
// sincronizaciones automáticas entre Calendly y el backend.
 async handleInviteeCreated(payload: any): Promise<void> {
    const calendlyUri: string = payload.event;
    const joinUrl: string | undefined = payload.location?.join_url;
    const startTime: string = payload.scheduled_event?.start_time;
    const endTime: string = payload.scheduled_event?.end_time;

    // Buscar por eventTypeUri — Calendly lo incluye en payload.event_type
    const eventTypeUri: string = payload.event_type;

    const event = await this.meetingsRepository.findOne({
      where: { calendlyUri },
    });

    if (!event) {
      this.logger.warn(`Evento no encontrado para eventTypeUri: ${eventTypeUri}`);
      return;
    }

    event.calendlyUri = calendlyUri;
    event.status = MeetingStatus.CONFIRMED;
    event.time = new Date(startTime).toISOString().split('T')[1];
    event.date = new Date(startTime);

    if (joinUrl) {
      event.joinUrl = joinUrl;
      this.logger.log(`join_url guardado: ${joinUrl}`);
    }

    await this.meetingsRepository.save(event);
  }

  async handleInviteeCanceled(payload: any): Promise<void> {

  }

  async registerWebhook(): Promise<void> {
    const orgUri = process.env.CALENDLY_ORG_URI; // GET /users/me → current_organization

    await firstValueFrom(
      this.httpService.post('/webhook_subscriptions', {
        url: 'https://tu-app.com/webhooks/calendly',
        events: ['invitee.created', 'invitee.canceled'],
        organization: orgUri,
        scope: 'organization',
      }),
    );

    this.logger.log('Webhook registrado en Calendly');
  }
}
