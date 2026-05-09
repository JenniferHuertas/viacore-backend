import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrainingDto {
  @IsNotEmpty({ message: 'El título de la capacitación es obligatorio' })
  @IsString({ message: 'El título debe ser un texto' })
  @ApiProperty({
    description: 'Este campo debe contener el título de la capacitación',
    example: 'Service Title Test 01',
  })
  title!: string;

  @IsNotEmpty({ message: 'La descripción de la capacitación es obligatoria' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @ApiProperty({
    description: 'Este campo debe contener la descripción de la capacitación',
    example: 'Service Description Test 01',
  })
  description!: string;

  @IsNotEmpty({ message: 'La categoría de la capacitación es obligatoria' })
  @IsString({ message: 'La categoría debe ser un texto' })
  @ApiProperty({
    description: 'Este campo debe contener la categoría de la capacitación',
    example: 'Service Category Test 01',
  })
  category!: string;

/*  @IsOptional()
  @IsString({ message: 'La URL de la imágen debe ser un texto' })
  @ApiProperty({
    description:
      'La imágen debe ser un formáto válido, que termine en .jpg/.jpeg/.png/.webp',
    example: 'http://......jpg',
  })
  imgUrl?: string;
*/
}
