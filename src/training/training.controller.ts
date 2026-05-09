import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  getAllTraining() {
    return this.trainingService.getAllTraining();
  }

  @Get(':id')
  getTrainingById(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getTrainingById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Capacitación NestJS' },
        description: { type: 'string', example: 'Curso básico de NestJS' },
        category: { type: 'string', example: 'Backend' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'category', 'file'],
    },
  })
  createTraining(
    @UploadedFile() file: Express.Multer.File,
    @Body() dataTraining: CreateTrainingDto) {
      console.log("hola11")
    return this.trainingService.createTraining(dataTraining, file);
  }

  @Post('seeder')
  seedTraining() {
    return this.trainingService.addTraining();
  }

  @Put(':id')
  updateTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dataTraining: UpdateTrainingDto,
  ) {
    return this.trainingService.updateTraining(id, dataTraining);
  }

  @Delete(':id')
  deleteTraining(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.deleteTraining(id);
  }
}
