import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentOrmRepository: Repository<Payment>,
  ) {}

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentOrmRepository.create(data);
    return await this.paymentOrmRepository.save(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return await this.paymentOrmRepository.findOne({
      where: { id },
      relations: ['user', 'trainingRequest'],
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        mercadoPagoId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<PaymentResponseDto[]> {
    return await this.paymentOrmRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'trainingRequest'],
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        mercadoPagoId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<PaymentResponseDto | null> {
    await this.paymentOrmRepository.update(id, { status });
    return this.findById(id);
  }

  async updateMercadoPagoId(id: string, mercadoPagoId: string): Promise<void> {
    await this.paymentOrmRepository.update(id, { mercadoPagoId });
  }

  async findAll(): Promise<PaymentResponseDto[]> {
    return await this.paymentOrmRepository.find({
      relations: ['user', 'trainingRequest'],
      select: {
        id: true,
        amount: true,
        status: true,
        mercadoPagoId: true,
        createdAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
