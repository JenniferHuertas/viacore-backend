import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TrainingRequests } from '../entities/training-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { CreateTrainingRequestDto } from '../dto/create-training-request.dto';

@Injectable()
export class TrainingRequestRepository {
  constructor(
    @InjectRepository(TrainingRequests)
    private readonly repository: Repository<TrainingRequests>,
  ) {}

  async createRequests(data: CreateTrainingRequestDto): Promise<TrainingRequests> {
    const newRequest = this.repository.create(data);
    return await this.repository.save(newRequest);
  }

  async findAllRequests(): Promise<TrainingRequests[]> {
    return await this.repository.find({
      relations: ['user'], 
      order: { createdAt: 'DESC' }, 
    });
  }
}