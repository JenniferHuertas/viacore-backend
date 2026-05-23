import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePaymentDto } from './dto/create-payment.dto';

import MercadoPagoConfig, {
  Preference,
  Payment as MpPayment,
} from 'mercadopago';

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

@Injectable()
export class PaymentsService {
  private preference: Preference;

  private mpPayment: MpPayment;

  constructor(
    private readonly paymentsRepository: PaymentsRepository,

    private readonly configService: ConfigService,

    @InjectRepository(TrainingRequests)
    private readonly trainingRequestOrmRepository: Repository<TrainingRequests>,

    private readonly emailService: EmailService,

    private readonly notificationsService: NotificationsService,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MP_ACCESS_TOKEN') ?? '',
    });

    this.preference = new Preference(client);

    this.mpPayment = new MpPayment(client);
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

  async createPreference(
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

    const response = await this.preference.create({
      body: {
        items: [
          {
            id: payment.id,

            title: `${trainingRequest.training.title}`,

            quantity: 1,

            unit_price: amount,

            currency_id: 'ARS',
          },
        ],

        back_urls: {
          success: `${this.configService.get('FRONTEND_URL')}/pago/${payment.id}/confirmacion`,

          failure: `${this.configService.get('FRONTEND_URL')}/payments/failure`,

          pending: `${this.configService.get('FRONTEND_URL')}/payments/pending`,
        },

        notification_url: `${this.configService.get(
          'BACKEND_URL',
        )}/payments/webhook`,

        external_reference: payment.id,
      },
    });

    return {
      paymentId: payment.id,

      init_point: response.init_point,
    };
  }

  async handleWebhook(body: {
    type: string;
    data: {
      id: string | number;
    };
  }): Promise<WebhookResponseDto> {
    const { type, data } = body;

    if (type === 'payment') {
      const mpPayment = await this.mpPayment.get({
        id: String(data.id),
      });

      const externalReference = mpPayment.external_reference;

      const status = mpPayment.status;

      const mercadoPagoId = String(mpPayment.id);

      const payment = await this.paymentsRepository.findById(
        externalReference ?? '',
      );

      if (!payment) {
        return { received: true };
      }

      await this.paymentsRepository.updateMercadoPagoId(
        payment.id,
        mercadoPagoId,
      );

      await this.paymentsRepository.updateStatus(
        payment.id,
        status as PaymentStatus,
      );

      if (status === PaymentStatus.APPROVED && payment.user?.email) {
        await this.emailService.sendPaymentApproved(
          payment.user.email,

          payment.user.companyName || payment.user.name,

          Number(payment.amount),
        );
      }

      if (status === PaymentStatus.APPROVED && payment.user) {
        await this.notificationsService.create({
          title: 'Pago aprobado',

          message: 'Tu pago fue aprobado correctamente.',

          type: NotificationType.PAYMENT_APPROVED,

          userId: payment.user.id,
        });
      }

      if (status === 'approved') {
        await this.trainingRequestOrmRepository.update(
          payment.trainingRequest.id,
          { status: RequestStatus.CONFIRMED },
        );
      }
    }

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
