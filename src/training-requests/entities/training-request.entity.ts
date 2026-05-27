import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { Exclude, Expose } from 'class-transformer';

import { Users } from '../../users/entities/user.entity';

import { RequestStatus } from '../enums/requests-status.enum';

import { Training } from '../../training/entities/training.entity';

import { FileResource } from '../../file-resource/entities/file-resource.entity';

import { Meetings } from '../../meetings/entities/meeting.entity';

import { Payment } from 'src/payments/entities/payment.entity';

@Exclude()
@Entity({
  name: 'TRAINING_REQUESTS',
})
export class TrainingRequests {
  @Expose({ groups: ['Get'] })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Expose({ groups: ['Get'] })
  @Column({ type: 'int' })
  participantsCount!: number;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'text',
    nullable: false,
  })
  objectives!: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'text',
    nullable: false,
  })
  context!: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Expose({ groups: ['Get'] })
  @CreateDateColumn()
  createdAt!: Date;

  @Expose({ groups: ['Get'] })
  @UpdateDateColumn()
  updatedAt!: Date;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  estimatedPrice?: number;

  @DeleteDateColumn()
  deletedAt!: Date;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  cancellationReason?: string;

  @Expose({ groups: ['Get'] })
  @ManyToOne(() => Users, (user) => user.trainingRequests)
  user!: Users;

  @Expose({ groups: ['Get'] })
  @ManyToOne(() => Training, (training) => training.trainingRequests)
  training!: Training;

  @Expose({ groups: ['Get'] })
  @OneToMany(() => FileResource, (file) => file.trainingRequest)
  files!: FileResource[];

  @Expose({ groups: ['Get'] })
  @OneToMany(() => Meetings, (meeting) => meeting.trainingRequest)
  meetings!: Meetings[];

  @Expose({ groups: ['Get'] })
  @OneToMany(() => Payment, (payment) => payment.trainingRequest)
  payments!: Payment[];
}
