import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateTrainingRequestDto } from './dto/create-training-request.dto';

import { UpdateTrainingRequestDto } from './dto/update-training-request.dto';

import { TrainingRequestRepository } from './repositories/training-request.repository';

@Injectable()
export class TrainingRequestService {
  constructor(
    private readonly repository: TrainingRequestRepository,
  ) {}

  async create(
    createTrainingRequestDto: CreateTrainingRequestDto,
    userId: string,
  ) {
    const requestData = {
      ...createTrainingRequestDto,
      user: { id: userId },
    };

    const result =
      await this.repository.createRequest(
        requestData,
      );

    if (!result) {
      throw new BadRequestException(
        'No se pudo procesar la solicitud.',
      );
    }

    return result;
  }

  async findAll() {
    return await this.repository.findAllRequests();
  }

  async findOne(id: string) {
    return await this.repository.findRequestById(
      id,
    );
  }

  async update(
    id: string,
    updateTrainingRequestDto: UpdateTrainingRequestDto,
  ) {
    return await this.repository.updateRequest(
      id,
      updateTrainingRequestDto,
    );
  }
}