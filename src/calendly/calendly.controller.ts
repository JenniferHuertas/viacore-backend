import { Controller, Post, Body, Headers, HttpCode, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CalendlyService } from './calendly.service';

@Controller('webhooks/calendly')
export class CalendlyController {
  constructor(
    private readonly calendlyService: CalendlyService,
  ) {}

  // Este endpoint recibirá automáticamente eventos
  // enviados por Calendly cuando una reunión:
  // - sea creada
  // - cancelada
  // - reagendada
  @Post()
  async webhook(@Body() payload: any) {
    return this.calendlyService.handleWebhook(payload);
  }

  // Este endpoint registra automáticamente
  // el webhook dentro de Calendly.
  //
  // IMPORTANTE:
  // Debes reemplazar la URL ngrok por tu URL pública real.
  @Post('register-webhook')
  async registerWebhook() {
    return this.calendlyService.createWebhookSubscription(
      'https://TU-NGROK.ngrok-free.app/calendly/webhook',
    );
  }
}