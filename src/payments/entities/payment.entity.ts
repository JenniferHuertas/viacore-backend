import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Users } from 'src/users/entities/user.entity';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

@Entity('PAYMENTS')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal' })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ nullable: true })
  paymentMethod!: string;

  @Column({ nullable: true })
  mercadoPagoId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user!: Users;

  @ManyToOne(() => TrainingRequests)
  @JoinColumn({ name: 'trainingRequestId' })
  trainingRequest!: TrainingRequests;
}
