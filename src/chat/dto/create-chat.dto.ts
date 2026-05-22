import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    example: 'Hola, me gustaría saber el estado de mi cotización para el taller de liderazgo.',
    description: 'Contenido del mensaje enviado',
  })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @IsString({ message: 'El mensaje debe ser un texto' })
  @MinLength(1, { message: 'El mensaje debe tener al menos 1 carácter' })
  message!: string;

  @ApiPropertyOptional({
    example: 'd6665706-a011-4394-934b-f4c40f0011f5',
    description: 'ID de la solicitud de capacitación vinculada al chat',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El id de la capacitación no es un UUID válido' })
  trainingRequestId!: string;

  @ApiPropertyOptional({
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
    description: 'ID del usuario destinatario (opcional)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El id del destinatario no es un UUID válido' })
  receiverId!: string;

  // --- NUEVA PROPIEDAD PARA PASO DE SESIÓN ANÓNIMA ---
  @ApiPropertyOptional({
    example: 'sesion-temporal-front-123',
    description: 'ID de sesión temporal generado por el frontend para usuarios anónimos',
  })
  @IsOptional()
  @IsString({ message: 'El sessionId debe ser una cadena de texto' })
  sessionId!: string;
}