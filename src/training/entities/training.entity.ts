import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  // OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { TrainingRequest } from '../training-request/training-request.entity';
import { FileResource } from '../../file-resource/entities/file-resource.entity';

@Entity({
  name: 'TRAINING',
})
export class Training {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @ApiProperty({
    description: 'Este campo debe contener el título de la capacitación',
    example: 'Service Title Test',
  })
  title!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @ApiProperty({
    description: 'Este campo debe contener la descripción de la capacitación',
    example: 'Service Description Test',
  })
  description!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @ApiProperty({
    description: 'Este campo debe contener la categoría de la capacitación',
    example: 'Service Category Test',
  })
  category!: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  @ApiProperty({
    description:
      'Define si el servicio esta Activo o no, por defecto se inicializan como "isActive = true"',
  })
  isActive!: boolean;

  // @Column({
  //   type: 'text',
  //   default: '',
  // })
  // @ApiProperty({
  //   description: 'Debe incluir una imagen de la capacitación',
  // })
  // imgUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // @OneToMany(() => TrainingRequest, (request) => request.training, {
  //   eager: false,
  // })
  // @ApiProperty({
  //   description: 'Solicitudes de capacitación asociadas a este training',
  //   type: () => TrainingRequest,
  //   isArray: true,
  // })
  // trainingRequests!: TrainingRequest[];

  @OneToOne(() => FileResource, (file) => file.training, {
    eager: false,
  })
  @JoinColumn()
  fileResource!: FileResource;
}
