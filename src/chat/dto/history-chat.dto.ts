import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class LinkHistoryDto {
  @ApiProperty({
    example: `sesion-temporal-front-123`,
    description: `ID de sesión temporal del usuario anónimo`,
  })
  @IsNotEmpty({ message: `El sessionId es requerido` })
  @IsString({ message: `El sessionId debe ser un texto` })
  sessionId!: string;

  @ApiProperty({
    example: `f9987e8e-2c32-42dd-92e8-7ffb0840fe1a`,
    description: `ID de la solicitud de capacitación real`,
  })
  @IsNotEmpty({ message: `El trainingRequestId es requerido` })
  @IsUUID(`4`, { message: `Debe ser un UUID válido` })
  trainingRequestId!: string;
}