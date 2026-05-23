import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";

import { Users } from "../../users/entities/user.entity";

@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  token!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => Users)
  user!: Users;

  @Column()
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;
}

