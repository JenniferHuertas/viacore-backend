import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    maxLength: 50,
    description: 'Nombre del usuario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    example: '+573001112233',
    maxLength: 30,
    description: 'Número de teléfono',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Colombia',
    maxLength: 50,
    description: 'País del usuario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({
    example: 'ViaCore',
    maxLength: 100,
    description: 'Nombre de la empresa',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @ApiPropertyOptional({
    example: 'Medellín',
    maxLength: 100,
    description: 'Ciudad del usuario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'Calle 10 #20-30',
    maxLength: 150,
    description: 'Dirección del usuario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  address?: string;
}