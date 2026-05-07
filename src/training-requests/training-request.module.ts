import { Module } from '@nestjs/common';
import { TrainingRequestService } from './training-request.service';
import { TrainingRequestController } from './training-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingRequests } from './entities/training-request.entity';
import { TrainingRequestRepository } from './repositories/training-request.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingRequests])
  ],
  controllers: [TrainingRequestController],
  providers: [TrainingRequestService, TrainingRequestRepository],
  exports: [TrainingRequestService]
})
export class TrainingRequestModule { }
