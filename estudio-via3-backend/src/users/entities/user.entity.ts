import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../enums/roles.enum';

@Entity({
  name: 'USERS',
})
export class Users {
  @Expose({ groups: ['newUser', 'Get'] })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose({ groups: ['newUser', 'Get'] })
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Expose({ groups: ['newUser', 'Get'] })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Exclude()
  password: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
  })
  phone: number;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
    length: 50,
  })
  country: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
    length: 100,
  })
  companyName: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;
}
