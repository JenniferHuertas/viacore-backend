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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('user/:userId')
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  findByUserId(@Param('userId') userId: string) {
    return this.paymentsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post('create-preference')
  @ApiBearerAuth('Bearer')
  @UseGuards(AuthGuard)
  createPreference(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPreference(dto);
  }

  @Post('webhook')
  handleWebhook(
    @Body() body: { type: string; data: { id: string | number } },
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query('data.id') dataId: string,
  ) {
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
