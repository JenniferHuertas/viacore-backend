import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsRepository } from './payments.repository';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from './enums/payment-status.enum';
import { RequestStatus } from 'src/training-requests/enums/requests-status.enum';
import { EmailService } from 'src/notifications/channels/email/email.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import {
  CreatePreferenceResponseDto,
  PaymentResponseDto,
  WebhookResponseDto,
} from './dto/payment-response.dto';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  private urlCulqui = 'https://api.culqi.com/v2';
  private culquiPrivateKey: string;

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    @InjectRepository(TrainingRequests)
    private readonly trainingRequestOrmRepository: Repository<TrainingRequests>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    this.culquiPrivateKey = this.configService.get<string>('CULQI_SECRET_KEY') ?? '';
  }

  async findAll(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate y endDate son obligatorios');
    }
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Formato de fecha inválido');
    }
    return this.paymentsRepository.findAllWithDateRange(start, end);
  }

  async createOrder(
    dto: CreatePaymentDto,
  ): Promise<CreatePreferenceResponseDto> {
    const trainingRequest = await this.trainingRequestOrmRepository.findOne({
      where: {
        id: dto.trainingRequestId,
      },
      relations: ['training', 'user'],
    });
    if (!trainingRequest) {
      throw new NotFoundException('Solicitud de capacitación no encontrada');
    }
    const amount = Number(trainingRequest.estimatedPrice);
    if (!amount || amount <= 0) {
      throw new BadRequestException(
        'El precio de la capacitación no es válido',
      );
    }
    const payment = await this.paymentsRepository.create({
      user: trainingRequest.user,
      trainingRequest: trainingRequest,
      amount: amount,
    });
    const amountInCents = amount * 100;
    const currency_code = 'PEN';
    const clientDetails = {
      first_name: trainingRequest.user.name,
      last_name: trainingRequest.user.name,
      email: trainingRequest.user.email,
      phone_number: trainingRequest.user.phone
    };
    const headers = {
      Authorization: `Bearer ${this.culquiPrivateKey}`,
    }
    const expirationDate = Math.floor(Date.now() / 1000) + (24 * 60 * 60); 
    const body = {
      amount: amountInCents,
      currency_code: currency_code,
      description: `Pago de capacitación: ${trainingRequest.training?.title || 'Curso ViaCore'}`.substring(0, 80),
      order_number: String(payment.id).substring(0, 36),
      expiration_date: expirationDate,
      client_details: clientDetails
    };
    const response = await firstValueFrom(this.httpService.post(`${this.urlCulqui}/orders`, body, { headers }));
    const culquiOrderId = response.data.id;
    await this.paymentsRepository.updateMercadoPagoId(
         payment.id,
         culquiOrderId,
    );
    return {
      paymentId: payment.id,
      culquiOrderId,
    };
  }

  async handleWebhook(body: {
    type: string;
    data: {
      id: string | number;
    };
  }): Promise<WebhookResponseDto> {
    const { type, data } = body;
    // if (type === 'payment') {
    //   const mpPayment = await this.mpPayment.get({
    //     id: String(data.id),
    //   });
    //   const externalReference = mpPayment.external_reference;
    //   const status = mpPayment.status;
    //   const mercadoPagoId = String(mpPayment.id);
    //   const payment = await this.paymentsRepository.findById(
    //     externalReference ?? '',
    //   );
    //   if (!payment) {
    //     return { received: true };
    //   }
    //   await this.paymentsRepository.updateMercadoPagoId(
    //     payment.id,
    //     mercadoPagoId,
    //   );
    //   await this.paymentsRepository.updateStatus(
    //     payment.id,
    //     status as PaymentStatus,
    //   );
    //   if (status === PaymentStatus.APPROVED && payment.user?.email) {
    //     await this.emailService.sendPaymentApproved(
    //       payment.user.email,
    //       payment.user.companyName || payment.user.name,
    //       Number(payment.amount),
    //     );
    //   }
    //   if (status === PaymentStatus.APPROVED && payment.user) {
    //     await this.notificationsService.create({
    //       title: 'Pago aprobado',
    //       message: 'Tu pago fue aprobado correctamente.',
    //       type: NotificationType.PAYMENT_APPROVED,
    //       userId: payment.user.id,
    //     });
    //   }
    //   if (status === 'approved') {
    //     await this.trainingRequestOrmRepository.update(
    //       payment.trainingRequest.id,
    //       { status: RequestStatus.CONFIRMED },
    //     );
    //     this.notificationsGateway.emitNotificationToAdmin({
    //       type: 'payment_approved',
    //       title: 'Nueva actualización de solicitud',
    //       message: `La solicitud de ${payment.user?.companyName || payment.user?.name} cambió a "confirmed"`,
    //       status: RequestStatus.CONFIRMED,
    //       requestId: payment.trainingRequest.id,
    //     });
    //   }
    // }
    return {
      received: true,
      message: 'Pago recibido',
    };
  }

  async findById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
    return payment;
  }

  findByUserId(userId: string): Promise<PaymentResponseDto[]> {
    return this.paymentsRepository.findByUserId(userId);
  }
}
