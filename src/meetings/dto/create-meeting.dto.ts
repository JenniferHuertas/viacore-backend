import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMeetingDto {
  @IsUUID()
  @IsNotEmpty()
  trainingRequestId!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  topic?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
      example: '2026-05-29',
  })
  date!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
      example: '12:00',
  })
  time!: string;
}