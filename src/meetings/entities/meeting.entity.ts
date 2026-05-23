import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MeetingStatus } from './meetingStatus.entity';

import { Users } from 'src/users/entities/user.entity';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';

@Entity({ name: 'MEETINGS' })
export class Meetings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  date!: Date;

  @Column({
    type: 'varchar',
  })
  time!: string;

  // Calendly será el proveedor principal de reuniones.
  // Aquí se almacena el scheduling link dinámico.
  @Column({
    type: 'varchar',
    nullable: true,
  })
  schedulingUrl!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  calendlyUri!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  joinUrl!: string;

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    enumName: 'MeetingStatus',
    default: MeetingStatus.PENDING,
  })
  status!: MeetingStatus;

  @ManyToOne(() => Users)
  user!: Users;

  @ManyToOne(() => TrainingRequests, (request) => request.meetings, {
    nullable: true,
  })
  trainingRequest!: TrainingRequests;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  reminder24hSent!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  reminder2hSent!: boolean;
}
