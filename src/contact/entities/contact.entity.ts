import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'CONTACT_MESSAGES',
})
export class ContactMessage {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  empresa?: string;

  @Column({
    type: 'text',
  })
  mensaje!: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;
}