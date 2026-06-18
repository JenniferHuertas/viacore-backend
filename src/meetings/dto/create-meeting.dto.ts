import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({
    description: 'ID de la solicitud de entrenamiento asociada a la reunión',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  trainingRequestId!: string;

  @ApiPropertyOptional({
    description: 'Tema o título personalizado de la reunión',
    example: 'Reunión inicial de onboarding',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({
    description: 'Fecha de la reunión en formato YYYY-MM-DD',
    example: '2026-05-29',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  date!: string;

  @ApiProperty({
    description: 'Hora de la reunión en formato HH:mm (intervalos de 30 minutos)',
    example: '14:30',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):(00|30)$/, {
    message: 'La hora debe tener el formato HH:mm y usar intervalos de 30 minutos',
  })
  time!: string;

  @ApiPropertyOptional({
    description: 'Timezone IANA del usuario que agenda la reunión',
    example: 'America/Bogota',
    default: 'America/Bogota',
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
