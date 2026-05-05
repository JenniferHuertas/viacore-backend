import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('training_requests')
export class TrainingRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  companyName!: string;

  @Column({ type: 'int' })
  numberOfPeople!: number;

  @Column({ type: 'text' })
  objectives!: string;

  @Column({ type: 'text' })
  context!: string;

  @Column({ 
    type: 'enum', 
    enum: ['pendiente', 'en proceso', 'finalizada'], 
    default: 'pendiente' 
  })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}