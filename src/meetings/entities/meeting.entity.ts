import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MeetingStatus } from './meetingStatus.entity';
import { Users } from 'src/users/entities/user.entity';

@Entity('MEETINGS2')
export class Meetings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Users)
  user!: Users;

  @Column({
    default: 'Scheduled Meeting',
  })
  topic!: string;

  @Column({
    type: 'timestamp',
  })
  startTime!: Date;

  @Column({
    type: 'timestamp',
  })
  endTime!: Date;

  @Column({
    nullable: true,
  })
  meetLink!: string;

  @Column({
    nullable: true,
  })
  googleEventId!: string;

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    enumName: 'MeetingStatus',
    default: MeetingStatus.PENDING,
  })
  status!: MeetingStatus;

  @Column({
    default: false,
  })
  reminderSent!: boolean;

  @ManyToOne(() => TrainingRequests, (request) => request.meetings, {
    nullable: true,
  })
  trainingRequest!: TrainingRequests;

  @CreateDateColumn()
  createdAt!: Date;
}