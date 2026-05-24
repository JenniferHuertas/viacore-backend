import {
  Column,
  JoinColumn,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Users } from '../../users/entities/user.entity';

import { TrainingRequests } from '../../training-request/entities/training-request.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
    default: 'CONFIRMED',
  })
  status!: string;

  @Column({
    default: false,
  })
  reminderSent!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
  () => Users,
  (user) => user.meetings,
  {
    nullable: false,
    onDelete: 'CASCADE',
  },
)
@JoinColumn({
  name: 'userId',
})
user!: Users;

@ManyToOne(
  () => TrainingRequests,
  (trainingRequest) => trainingRequest.meetings,
  {
    nullable: false,
    onDelete: 'CASCADE',
  },
)
@JoinColumn({
  name: 'trainingRequestId',
})
trainingRequest!: TrainingRequests;


}