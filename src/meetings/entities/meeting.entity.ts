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
    nullable: true
  })
  joinUrl!: string

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    enumName: 'MeetingStatus',
    default: MeetingStatus.PENDING,
  })
  status!: MeetingStatus;

  @ManyToOne(() => Users)
  user!: Users;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}