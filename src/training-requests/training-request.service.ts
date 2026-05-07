import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateTrainingRequestDto } from './dto/create-training-request.dto';
import { UpdateTrainingRequestDto } from './dto/update-training-request.dto';
import { TrainingRequestRepository } from './repositories/training-request.repository';

@Injectable()
export class TrainingRequestService {
  constructor(
    private readonly repository: TrainingRequestRepository) {}
  async create(createTrainingRequestDto: CreateTrainingRequestDto, userId: string) {
    const requestData = {
      ...createTrainingRequestDto,
      user: { id: userId }
    };
    const result = await this.repository.createRequest(requestData);
    if (!result) {
      throw new BadRequestException('No se pudo procesar la solicitud.');
    }
    console.log(`Trigger: Enviando notificación de confirmación al usuario ${userId}`);
    // this.mailService.sendConfirmation(result.user.email);
    return result;
  }

  /*findAll() {
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
  }*/
}
