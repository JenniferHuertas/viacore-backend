import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

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
    length: 100,
    nullable: false,
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
    type: 'text',
  })
  address: string;

  @Expose({ groups: ['Get'] })
  @Column({
    type: 'varchar',
    length: 50,
  })
  city: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  @Exclude()
  isAdmin: boolean;
}
