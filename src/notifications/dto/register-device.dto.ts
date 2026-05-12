import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RegisterDeviceDto {
  @IsUUID()
  userId!: string;

  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;
}