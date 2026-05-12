import {
  IsDateString,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMeetingDto {
  @IsDateString()
  date!: Date;

  @IsString()
  time!: string;

  @IsUUID()
  targetUserId!: string;

  @IsUUID()
  trainingRequestId!: string;
}