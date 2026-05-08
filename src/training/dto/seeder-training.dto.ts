import { IsNotEmpty, IsString } from 'class-validator';

export class SeedTraining {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsNotEmpty()
  @IsString()
  imgUrl?: string;
}
