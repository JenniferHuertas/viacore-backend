import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  createPreference(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPreference(dto);
  }

  @Post('webhook')
  handleWebhook(@Body() body: { type: string; data: { id: string | number } }) {
    return this.paymentsService.handleWebhook(body);
  }
}
