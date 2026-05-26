import { ApiProperty } from '@nestjs/swagger';

import {
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class RescheduleMeetingDto {

  @ApiProperty({
    description:
      'Nueva fecha y hora de la reunión en formato ISO 8601',
    example: '2026-05-26T11:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  newStartTime!: string;
}