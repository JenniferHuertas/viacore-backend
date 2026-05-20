import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Headers,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import {
  CreatePreferenceResponseDto,
  PaymentResponseDto,
  WebhookResponseDto,
} from './dto/payment-response.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Obtener todos los pagos (solo admin)' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findAll();
  }

  @Get('user/:userId')
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener pagos por usuario' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  findByUserId(@Param('userId') userId: string): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  findById(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findById(id);
  }

  @Post('create-preference')
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Crear preferencia de pago en MercadoPago' })
  @ApiResponse({ status: 201, type: CreatePreferenceResponseDto })
  createPreference(
    @Body() dto: CreatePaymentDto,
  ): Promise<CreatePreferenceResponseDto> {
    return this.paymentsService.createPreference(dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de MercadoPago' })
  @ApiResponse({ status: 200, type: WebhookResponseDto })
  handleWebhook(
    @Body() body: { type: string; data: { id: string | number } },
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query('data.id') dataId: string,
  ): Promise<WebhookResponseDto> {
    const secret = this.configService.get<string>('MP_WEBHOOK_SECRET') ?? '';
    const ts = xSignature
      ?.split(',')
      .find((p) => p.startsWith('ts='))
      ?.split('=')[1];
    const v1 = xSignature
      ?.split(',')
      .find((p) => p.startsWith('v1='))
      ?.split('=')[1];
    const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(template)
      .digest('hex');

    if (hash !== v1) {
      throw new BadRequestException('Firma inválida');
    }

    return this.paymentsService.handleWebhook(body);
  }
}
