import { Injectable } from '@nestjs/common';
import { CreateTrainingRequestDto } from './dto/create-training-request.dto';
import { UpdateTrainingRequestDto } from './dto/update-training-request.dto';

@Injectable()
export class TrainingRequestService {
  create(createTrainingRequestDto: CreateTrainingRequestDto) {
    return 'This action adds a new trainingRequest';
  }

  findAll() {
    return `This action returns all trainingRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trainingRequest`;
  }

  update(id: number, updateTrainingRequestDto: UpdateTrainingRequestDto) {
    return `This action updates a #${id} trainingRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} trainingRequest`;
  }
}
