import { Injectable } from '@nestjs/common';
import { TrainingRepository } from './training.repository';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import dataTrainings from '../helpers/trainingData.json';
import { TrainingCardResponseDto } from './dto/training-card-response.dto';
import { TrainingDetailResponseDto } from './dto/training-detail-response.dto';
import { Training } from './entities/training.entity';

@Injectable()
export class TrainingService {
  constructor(private readonly trainingRepository: TrainingRepository) {}

  getAllTraining(): Promise<TrainingCardResponseDto[]> {
    return this.trainingRepository.getAllTraining();
  }

  getTrainingById(id: string): Promise<TrainingDetailResponseDto> {
    return this.trainingRepository.getTrainingById(id);
  }

  createTraining(
    dataTraining: CreateTrainingDto,
    file?: Express.Multer.File,
  ): Promise<Training> {
    return this.trainingRepository.createTraining(dataTraining, file);
  }

  addTraining(): Promise<Training[]> {
    return this.trainingRepository.addTraining(dataTrainings);
  }

  updateTraining(
    id: string,
    dataTraining: UpdateTrainingDto,
  ): Promise<Training | null> {
    return this.trainingRepository.updateTraining(id, dataTraining);
  }

  deleteTraining(id: string): Promise<{ message: string }> {
    return this.trainingRepository.deleteTraining(id);
  }
}
