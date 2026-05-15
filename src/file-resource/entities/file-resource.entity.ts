import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Training } from '../../training/entities/training.entity';
import { TrainingRequests } from '../../training-requests/entities/training-request.entity';


@Entity('FILE_RESOURCE')
export class FileResource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  fileUrl!: string;

  @Column()
  fileType!: string;

  @Column({ type: 'uuid', nullable: true })
  trainingRequestId?: string;

  // 1–1 con Training (material / imagen)
  @OneToOne(() => Training, (training) => training.fileResource, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  training?: Training;

  @ManyToOne(() => TrainingRequests, (request) => request.files, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainingRequestId' })
  trainingRequest?: TrainingRequests;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
