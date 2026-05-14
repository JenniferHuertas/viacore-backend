// calendly.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CreateOneOffEventDto {
  name: string;
  startTime: string; // ISO 8601, ej: "2026-05-20T10:00:00Z"
  endTime: string;
  guestEmail: string;
  guestName: string;
  location?: string;
}

@Injectable()
export class CalendlyService {
  private readonly logger = new Logger(CalendlyService.name);
  private readonly userUri = process.env.CALENDLY_USER_URI;

  constructor(private readonly httpService: HttpService) {}

  /** Obtiene los event types disponibles del usuario */
  async getEventTypes(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService.get('/event_types', {
        params: { user: this.userUri },
      }),
    );
    return data.collection;
  }

  /** Crea un one-off event (link personalizado) */
  async createOneOffEvent(dto: CreateOneOffEventDto): Promise<any> {
    const payload = {
      name: dto.name,
      host: this.userUri,
      start_time: dto.startTime,
      end_time: dto.endTime,
      guests: [{ email: dto.guestEmail, name: dto.guestName }],
      ...(dto.location && {
        location: { type: 'custom', location: dto.location },
      }),
    };

    const { data } = await firstValueFrom(
      this.httpService.post('/one_off_event_types', payload),
    );

    this.logger.log(`Evento creado: ${data.resource?.scheduling_url}`);
    return data.resource;
  }

  /** Lista eventos programados */
  async getScheduledEvents(status: 'active' | 'canceled' = 'active'): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService.get('/scheduled_events', {
        params: { user: this.userUri, status },
      }),
    );
    return data.collection;
  }

  /** Cancela un evento por su UUID */
  async cancelEvent(eventUuid: string, reason?: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(`/scheduled_events/${eventUuid}/cancellation`, {
        reason: reason ?? 'Cancelado por el sistema',
      }),
    );
    this.logger.log(`Evento ${eventUuid} cancelado`);
  }
}