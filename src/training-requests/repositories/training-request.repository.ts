import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';

import { TrainingRequests } from '../entities/training-request.entity';

import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TrainingRequestRepository {
  constructor(
    @InjectRepository(TrainingRequests)
    private readonly repository: Repository<TrainingRequests>,
  ) {}

  async createRequest(data: any) {
    const newRequest = this.repository.create(data);

    return await this.repository.save(newRequest);
  }

  async findAllRequests() {
    return await this.repository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findRequestById(id: string) {
    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async updateRequest(
    id: string,
    data: any,
  ) {
    await this.repository.update(id, data);

    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }
}