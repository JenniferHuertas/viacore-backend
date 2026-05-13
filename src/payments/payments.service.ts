import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class PaymentsService {
  private preference: Preference;
  private mpPayment: MpPayment;

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly configService: ConfigService,
    @InjectRepository(TrainingRequests)
    private readonly trainingRequestOrmRepository: Repository<TrainingRequests>,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MP_ACCESS_TOKEN') ?? '',
    });
    this.preference = new Preference(client);
    this.mpPayment = new MpPayment(client);
  }

  async createPreference(dto: CreatePaymentDto) {
    const trainingRequest = await this.trainingRequestOrmRepository.findOne({
      where: { id: dto.trainingRequestId },
      relations: ['training', 'user'],
    });

    if (!trainingRequest) {
      throw new NotFoundException('Solicitud de capacitación no encontrada');
    }

    const depositAmount =
      Number(this.configService.get('MP_DEPOSIT_AMOUNT')) || 30000;

    const payment = await this.paymentsRepository.create({
      user: trainingRequest.user,
      trainingRequest: trainingRequest,
      amount: depositAmount,
    });

    const response = await this.preference.create({
      body: {
        items: [
          {
            id: payment.id,
            title: `Seña - ${trainingRequest.training.title}`,
            quantity: 1,
            unit_price: depositAmount,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${this.configService.get('FRONTEND_URL')}/payments/success`,
          failure: `${this.configService.get('FRONTEND_URL')}/payments/failure`,
          pending: `${this.configService.get('FRONTEND_URL')}/payments/pending`,
        },
        notification_url: `${this.configService.get('BACKEND_URL')}/payments/webhook`,
        external_reference: payment.id,
      },
    });

    return {
      paymentId: payment.id,
      init_point: response.init_point,
    };
  }

  async handleWebhook(body: { type: string; data: { id: string | number } }) {
    // MP manda el tipo de evento y el id
    const { type, data } = body;

    if (type === 'payment') {
      // Consultás a MP los detalles del pago
      const mpPayment = await this.mpPayment.get({ id: String(data.id) });

      // Buscás el payment en tu DB por el external_reference (que es tu payment.id)
      const externalReference = mpPayment.external_reference;
      const status = mpPayment.status; // 'approved', 'rejected', 'pending'
      const mercadoPagoId = String(mpPayment.id);

      const payment = await this.paymentsRepository.findById(
        externalReference ?? '',
      );

      if (!payment) return { received: true };

      // Actualizás el status en la DB
      await this.paymentsRepository.updateMercadoPagoId(
        payment.id,
        mercadoPagoId,
      );
      await this.paymentsRepository.updateStatus(
        payment.id,
        status as PaymentStatus,
      );
    }
    return { received: true };
  }
}
