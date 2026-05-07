import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  READ = 'READ',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  subject?: string;

  @Column('text')
  message?: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status?: NotificationStatus;

  @Column('uuid')
  userId?: string;

  @Column('uuid', { nullable: true })
  trainingRequestId?: string;

  @Column('uuid', { nullable: true })
  meetingId?: string;

  @Column('uuid', { nullable: true })
  paymentId?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}