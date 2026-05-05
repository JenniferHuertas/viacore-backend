import { Module } from '@nestjs/common';
import { TrainingRequestService } from './training-request.service';
import { TrainingRequestController } from './training-request.controller';

@Module({
  controllers: [TrainingRequestController],
  providers: [TrainingRequestService],
})
export class TrainingRequestModule {}
