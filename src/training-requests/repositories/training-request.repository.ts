import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';

import { TrainingRequests } from '../entities/training-request.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { RequestStatus } from '../enums/requests-status.enum';
import type {
  ICreateTrainingRequest,
  IUpdateTrainingRequest
} from '../interfaces/requests-data.interfaces';


@Injectable()
export class TrainingRequestRepository {
  constructor(
    @InjectRepository(TrainingRequests)
    private readonly repository: Repository<TrainingRequests>,
  ) { }

  async createRequests(
    data: ICreateTrainingRequest & { user: { id: string } }
  ): Promise<TrainingRequests> {
    const newRequest = this.repository.create(data);
    return await this.repository.save(newRequest);
  }

  async findAllRequests(
    skip: number,
    take: number,
    status?: RequestStatus
  ): Promise<[TrainingRequests[], number]> {
    const whereCondition = status ? { status: status } : {};
    return await this.repository.findAndCount({
      where: whereCondition,
      relations: ['user', 'training'],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take,
    });
  }

  async findRequestById(
    id: string
  ): Promise<TrainingRequests | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'training'],
    });
  }

  async findMyRequests(userId: string): Promise<TrainingRequests[]> {
    return await this.repository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'training'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateRequest(
    id: string,
    data: IUpdateTrainingRequest,
  ): Promise<TrainingRequests | null> {
    await this.repository.update(id, data);
    return await this.findRequestById(id);
  }

  async saveRequest(
    request: TrainingRequests
  ): Promise<TrainingRequests> {
    return await this.repository.save(request);
  }

}