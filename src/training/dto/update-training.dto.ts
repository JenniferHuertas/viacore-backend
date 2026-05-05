import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTrainingDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @ApiProperty({
    description: 'Este campo debe contener el título de la capacitación',
    example: 'Service Title Test 02',
  })
  title?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @ApiProperty({
    description: 'Este campo debe contener la descripción de la capacitación',
    example: 'Service Description Test 02',
  })
  description?: string;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser un texto' })
  @ApiProperty({
    description: 'Este campo debe contener la categoría de la capacitación',
    example: 'Service Category Test 02',
  })
  category?: string;

  @IsOptional()
  @IsString({ message: 'La URL de la imágen debe ser un texto' })
  @ApiProperty({
    description:
      'La imágen debe ser un formáto válido, que termine en .jpg/.jpeg/.png/.webp',
    example: 'http://......png',
  })
  imgUrl?: string;
}
