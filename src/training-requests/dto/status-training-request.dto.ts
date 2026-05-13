import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RequestStatus } from '../enums/requests-status.enum';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud',
    enum: RequestStatus,
    example: RequestStatus.CONFIRMED,
  })
  @IsEnum(RequestStatus, {
    message: 'El estado debe ser: pending, confirmed o rejected',
  })
  status!: RequestStatus;
}