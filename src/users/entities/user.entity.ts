import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../enums/roles.enum';

@Entity({
  name: 'USERS',
})
export class Users {
  @Expose({ groups: ['newUser', 'Get'] })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Expose({ groups: ['newUser', 'Get'] })
  @Column({
    type: 'varchar',
    length: 50,
  })
  name!: string;

  @Expose({ groups: ['newUser', 'Get'] })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Exclude()
  password!: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
  })
  phone!: number;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
    length: 50,
  })
  country!: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
    length: 100,
  })
  companyName!: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role!: Role;
  role: Role;

  @Expose({ groups: ['Get'] })
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Expose({ groups: ['Get'] })
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
