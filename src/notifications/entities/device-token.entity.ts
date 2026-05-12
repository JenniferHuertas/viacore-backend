import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Users } from '../../users/entities/user.entity';

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
  })
  token!: string;

  @Column({
    nullable: true,
  })
  platform?: string;

  @Column({
    nullable: true,
  })
  deviceName?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(
    () => Users,
    (user) => user.deviceTokens,
    {
      onDelete: 'CASCADE',
    },
  )
  user!: Users;

  @Column()
  userId!: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastUsedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}