import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class RescheduleMeetingDto {
  @ApiProperty({
    description: 'Nueva fecha de la reunión en formato YYYY-MM-DD',
    example: '2026-05-29',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  date!: string;

  @ApiProperty({
    description: 'Nueva hora en formato HH:mm (intervalos de 30 minutos)',
    example: '14:30',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):(00|30)$/, {
    message: 'La hora debe tener el formato HH:mm y usar intervalos de 30 minutos',
  })
  time!: string;

  @ApiPropertyOptional({
    description: 'Timezone IANA del usuario que reagenda la reunión',
    example: 'America/Bogota',
    default: 'America/Bogota',
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
