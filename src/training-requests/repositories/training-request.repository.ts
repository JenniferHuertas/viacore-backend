import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm'; // Importamos DataSource
import { TrainingRequests } from '../entities/training-request.entity';
import { RequestStatus } from '../enums/requests-status.enum';
import type {
  ICreateTrainingRequest,
  IUpdateTrainingRequest
} from '../interfaces/requests-data.interfaces';

@Injectable()
export class TrainingRequestRepository extends Repository<TrainingRequests> {
  constructor(private dataSource: DataSource) {
    super(TrainingRequests, dataSource.createEntityManager());
  }

  async createRequests(
    data: ICreateTrainingRequest & { user: { id: string }; estimatedPrice: number }
  ): Promise<TrainingRequests> {
    const newRequest = this.create(data);
    return await this.save(newRequest);
  }

  async findAllRequests(
    skip: number,
    take: number,
    status?: RequestStatus
  ): Promise<[TrainingRequests[], number]> {
    const whereCondition = status ? { status: status } : {};
    return await this.findAndCount({
      where: whereCondition,
      relations: ['user', 'training', 'files', 'meetings'],
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
    return await this.findOne({
      where: { id },
      relations: ['user', 'training', 'files', 'meetings'],
    });
  }

  async findMyRequests(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<[TrainingRequests[], number]> { 
    const skip = (page - 1) * limit;

    return await this.findAndCount({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'training', 'files', 'meetings'],
      order: {
        createdAt: 'DESC',
      },
      skip: skip,
      take: limit,
    });
  }

  async updateRequest(
    id: string,
    data: IUpdateTrainingRequest & { estimatedPrice?: number }
  ): Promise<TrainingRequests | null> {
    await this.update(id, data);
    return await this.findRequestById(id);
  }

  async saveRequest(
    request: TrainingRequests
  ): Promise<TrainingRequests> {
    return await this.save(request);
  }
}