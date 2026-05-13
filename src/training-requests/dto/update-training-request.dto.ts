import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTrainingRequestDto } from './create-training-request.dto';
import { RequestStatus } from '../enums/requests-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTrainingRequestDto extends PartialType(
  CreateTrainingRequestDto,
) {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}