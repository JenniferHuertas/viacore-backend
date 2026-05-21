import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ContactDto {

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  empresa?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  mensaje!: string;
}