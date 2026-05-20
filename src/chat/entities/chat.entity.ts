import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import {
  Expose,
  Exclude,
} from 'class-transformer';

import { Users } from '../../users/entities/user.entity';

import { TrainingRequests } from '../../training-requests/entities/training-request.entity';

@Exclude()
@Entity({
  name: 'CHAT_MESSAGES',
})
export class ChatMessage {

  @Expose({ groups: ['get'] })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Expose({ groups: ['get'] })
  @Column({
    type: 'text',
    nullable: false,
  })
  message!: string;

  @Expose({ groups: ['get'] })
  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'assistant'],
    default: 'user',
  })
  role!: string;

  @Expose({ groups: ['get'] })
  @Column({
    type: 'boolean',
    default: false,
  })
  isAiGenerated!: boolean;

  @Expose({ groups: ['get'] })
  @CreateDateColumn()
  createdAt!: Date;

  // Relaciones

  @Expose({ groups: ['get'] })
  @ManyToOne(
    () => Users,
    (user) => user.messagesSent,
  )
  sender!: Users;

  @Expose({ groups: ['get'] })
  @ManyToOne(
    () => Users,
    {
      nullable: true,
    },
  )
  receiver?: Users;

  @Expose({ groups: ['get'] })
  @ManyToOne(
    () => TrainingRequests,
    (request) => request.id,
    {
      nullable: true,
    },
  )
  trainingRequest!: TrainingRequests;
}