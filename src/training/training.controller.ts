import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

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
  createTraining(@Body() dataTraining: CreateTrainingDto) {
    return this.trainingService.createTraining(dataTraining);
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
