import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({
    type: 'text',
    default: '',
  })
  @ApiProperty({
    description:
      'Debe ser una URL válida, que finalice en .jpg/.jpeg/.png/.webp',
  })
  imgUrl!: string;
}
