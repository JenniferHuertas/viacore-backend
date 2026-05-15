import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: '...',
  })
  trainingRequestId!: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: '...',
  })
  userId!: string;
}
