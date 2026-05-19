import { ApiProperty } from '@nestjs/swagger';
import { FileResourceResponseDto } from './training-card-response.dto';

export class TrainingDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  tagline!: string;

  @ApiProperty({ type: [String] })
  includes!: string[];

  @ApiProperty({ type: () => FileResourceResponseDto, nullable: true })
  fileResource?: FileResourceResponseDto;

  @ApiProperty()
  shortDescription!: string;

  @ApiProperty()
  category!: string;
}
