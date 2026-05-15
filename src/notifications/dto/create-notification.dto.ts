import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsEnum(NotificationType)
  type!: NotificationType;
}