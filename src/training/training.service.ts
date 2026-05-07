import { Injectable } from '@nestjs/common';
import { TrainingRepository } from './training.repository';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import dataTrainings from '../helpers/trainingData.json';

@Injectable()
export class TrainingService {
  constructor(private readonly trainingRepository: TrainingRepository) {}

  getAllTraining() {
    return this.trainingRepository.getAllTraining();
  }

  getTrainingById(id: string) {
    return this.trainingRepository.getTrainingById(id);
  }

  createTraining(dataTraining: CreateTrainingDto) {
    return this.trainingRepository.createTraining(dataTraining);
  }

  addTraining() {
    return this.trainingRepository.addTraining(dataTrainings);
  }

  updateTraining(id: string, dataTraining: UpdateTrainingDto) {
    return this.trainingRepository.updateTraining(id, dataTraining);
  }

  deleteTraining(id: string) {
    return this.trainingRepository.deleteTraining(id);
  }
}
