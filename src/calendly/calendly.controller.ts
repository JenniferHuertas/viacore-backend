import { Controller, Post, Body, Headers, HttpCode, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CalendlyService } from './calendly.service';

@Controller('webhooks/calendly')
export class CalendlyController {
  private readonly logger = new Logger(CalendlyController.name);

  constructor(private readonly calendlyService: CalendlyService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('calendly-webhook-signature') signature: string,
  ) {
    // 1. Verificar firma
    if (!this.isValidSignature(JSON.stringify(body), signature)) {
      this.logger.warn('Firma de webhook inválida');
      throw new UnauthorizedException('Firma inválida');
    }

    // 2. Rutear según el tipo de evento
    switch (body.event) {
      case 'invitee.created':
        await this.calendlyService.handleInviteeCreated(body.payload);
        break;
      case 'invitee.canceled':
        await this.calendlyService.handleInviteeCanceled(body.payload);
        break;
      default:
        this.logger.log(`Evento no manejado: ${body.event}`);
    }

    return { status: 'ok' };
  }

  private isValidSignature(payload: string, signature: string): boolean {
    if (!signature) return false;
    const secret = process.env.CALENDLY_WEBHOOK_KEY;
    if (!secret) { return false; }
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  }
}