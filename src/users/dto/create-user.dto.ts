import { ApiProperty, PickType } from '@nestjs/swagger';

import { Exclude } from 'class-transformer';

import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { MatchPassword } from 'src/helpers/matchPassword';

export class CreateUserDto {
  @ApiProperty({
    example: 'algo@example.com',
    description: 'Email del usuario',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Daniel Medina',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: 'Password21@',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.,!@#$%^&*()_\-+=\[\]{};:'"\\|<>/?`~]).+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
    },
  )
  password!: string;

  @ApiProperty({
    example: 'Password21@',
  })
  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  confirmPassword!: string;

@ApiProperty({
  example: '+5493434123456',
})
@IsOptional()
@IsString()
@Matches(/^\+?[1-9]\d{7,14}$/, {
  message:
    'Phone must be a valid international phone number',
})
phone?: string;

  @ApiProperty({
    example: 'Argentina',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  country?: string;

  @ApiProperty({
    example: 'ViaCore',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  companyName?: string;

  @ApiProperty({
    example: 'Buenos Aires',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  city?: string;

  @ApiProperty({
    example: 'Av. Corrientes 1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  address?: string;

  @Exclude()
  @IsEmpty()
  isActive?: boolean;

  @Exclude()
  @IsEmpty()
  profileCompleted?: boolean;
}

export class LoginUserDto extends PickType(
  CreateUserDto,
  ['password', 'email'] as const,
) {}

export class CompleteProfileDto extends PickType(
  CreateUserDto,
  [
    'phone',
    'country',
    'companyName',
    'city',
    'address',
  ] as const,
) {}
