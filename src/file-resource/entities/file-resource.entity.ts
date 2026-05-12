import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Training } from '../../training/entities/training.entity';
//import { TrainingRequest } from '../training-request/training-request.entity';

@Entity('FILE_RESOURCE')
export class FileResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: string;

  // 1–1 con Training (material / imagen)
  @OneToOne(() => Training, (training) => training.fileResource, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  training?: Training;

  // 0–1 con TrainingRequest (documento adjunto)
  /*@OneToOne(
    () => TrainingRequest,
    (trainingRequest) => trainingRequest.file,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  trainingRequest?: TrainingRequest;*/

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
