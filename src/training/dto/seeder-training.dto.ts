import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SeedTraining {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  shortDescription!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  tagline!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString()
  includes!: string[];

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsNotEmpty()
  @IsString()
  imgUrl?: string;
}
