import { IsDateString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RescheduleMeetingDto {
  @ApiProperty({
    example: '2026-05-26T11:00:00.000Z',
  })
  @IsDateString()
  newStartTime!: string;
}