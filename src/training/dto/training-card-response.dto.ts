import { ApiProperty } from '@nestjs/swagger';

export class FileResourceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fileUrl!: string;

  @ApiProperty()
  fileType!: string;

  @ApiProperty()
  title!: string;
}

export class TrainingCardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  shortDescription!: string;

  @ApiProperty({ type: () => FileResourceResponseDto, nullable: true })
  fileResource?: FileResourceResponseDto;
}
