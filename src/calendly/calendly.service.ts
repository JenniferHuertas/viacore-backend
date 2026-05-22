import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

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

import { EmailService } from 'src/notifications/channels/email/email.service';

@Injectable()
export class CalendlyService {
  private readonly logger = new Logger(
    CalendlyService.name,
  );

  // Se cachea el user URI para evitar
  // llamadas innecesarias a Calendly.
  private userUri: string | null = null;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Meetings)
    private readonly meetingsRepository: Repository<Meetings>,
    private readonly emailService: EmailService
  ) {}

  // Obtiene automáticamente el URI
  // del usuario autenticado en Calendly.
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

  // Crea un scheduling link dinámico.
  //
  // IMPORTANTE:
  // Esto NO crea una reunión final.
  //
  // Calendly usa:
  // scheduling links -> usuario agenda -> evento real.
  async createOneOffEvent(
    dto: CreateOneOffEventDto,
  ): Promise<any> {
    try {
      const userUri =
        await this.getCurrentUserUri();

      // Calendly requiere:
      // - duración
      // - rango de fechas
      // - ubicación
      const payload = {
        name: dto.name,

        host: userUri,

        duration: 30,

        date_setting: {
          type: 'date_range',

          start_date:
            dto.startTime.split('T')[0],

          end_date:
            dto.endTime.split('T')[0],
        },

        // Calendly generará automáticamente
        // el enlace virtual si:
        // - Zoom
        // - Google Meet
        // - Teams
        // está conectado.
        location: {
          kind: 'zoom_conference',
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post(
          '/one_off_event_types',
          payload,
        ),
      );

      this.logger.log(
        `Scheduling URL creada: ${data.resource?.scheduling_url}`,
      );

      return data.resource;
    } catch (error: any) {
      this.logger.error(
        error?.response?.data ||
          error.message,
      );

      throw new InternalServerErrorException(
        'Error al crear evento en Calendly',
      );
    }
  }


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

    this.emailService.sendMeetingCreated(event.user.email, event.user.companyName, event.time, event.joinUrl)
  }

  async handleInviteeCanceled(payload: any): Promise<void> {

  }

  // Registra automáticamente un webhook
  // dentro de Calendly.
  //
  // Esto permitirá que el backend reciba:
  // - confirmaciones
  // - cancelaciones
  // - reagendamientos
  async createWebhookSubscription(
    webhookUrl: string,
  ) {
    try {
      const userUri = process.env.CALENDLY_URI!
        //await this.getCurrentUserUri();

      // Calendly requiere organization URI.
      // Se transforma automáticamente.
      const organizationUri = process.env.CALENDLY_ORG_URI!
        // userUri.replace(
        //   '/users/',
        //   '/organizations/',
        // );

      const payload = {
        url: webhookUrl,

        events: [
          'invitee.created',
          'invitee.canceled',
        ],

        organization: organizationUri,

        scope: 'user',

        user: userUri
      };

      const { data } = await firstValueFrom(
        this.httpService.post(
          '/webhook_subscriptions',
          payload,
        ),
      );

      this.logger.log(
        'Webhook registrado correctamente',
      );

      return data.resource;
    } catch (error: any) {
      this.logger.error(
        error?.response?.data ||
          error.message,
      );

      throw new InternalServerErrorException(
        'Error creando webhook subscription',
      );
    }
  }

  // Procesa eventos enviados automáticamente
  // por Calendly.
  //
  // Aquí llegará:
  // - fecha
  // - hora
  // - meet URL
  // - cancel URL
  // - reschedule URL
  // - emails
  // - estado
  async handleWebhook(payload: any) {
    try {
      const event = payload.event;

      // Usuario confirmó/agendó reunión.
      if (event === 'invitee.created') {
        this.handleInviteeCreated(payload)
      }

      // Usuario canceló reunión.
      if (
        event === 'invitee.canceled'
      ) {
        this.logger.warn(
          'Reunión cancelada',
        );

        return {
          status: 'cancelled',
        };
      }

      return {
        received: true,
      };
    } catch (error: any) {
      this.logger.error(
        error?.response?.data ||
          error.message,
      );

      throw new InternalServerErrorException(
        'Error procesando webhook',
      );
    }
  }
}
