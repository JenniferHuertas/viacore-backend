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
      const userUri =
        await this.getCurrentUserUri();

      // Calendly requiere organization URI.
      // Se transforma automáticamente.
      const organizationUri =
        userUri.replace(
          '/users/',
          '/organizations/',
        );

      const payload = {
        url: webhookUrl,

        events: [
          'invitee.created',
          'invitee.canceled',
        ],

        organization: organizationUri,

        scope: 'user',
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
        const data = payload.payload;

        const meetingInfo = {
          status: 'confirmed',

          inviteeName: data?.name,

          inviteeEmail: data?.email,

          eventUri: data?.event,

          inviteeUri: data?.uri,

          cancelUrl: data?.cancel_url,

          rescheduleUrl:
            data?.reschedule_url,

          scheduledEvent:
            data?.scheduled_event,

          startTime:
            data?.scheduled_event
              ?.start_time,

          endTime:
            data?.scheduled_event
              ?.end_time,

          // Aquí llegará:
          // - Zoom URL
          // - Meet URL
          // - Teams URL
          meetingUrl:
            data?.scheduled_event
              ?.location?.join_url,
        };

        this.logger.log(meetingInfo);

        // Aquí después conectarás:
        // - Prisma
        // - notificaciones
        // - emails
        // - actualizaciones DB
        return meetingInfo;
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