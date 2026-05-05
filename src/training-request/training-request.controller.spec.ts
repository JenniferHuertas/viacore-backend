import { Test, TestingModule } from '@nestjs/testing';
import { TrainingRequestController } from './training-request.controller';
import { TrainingRequestService } from './training-request.service';

describe('TrainingRequestController', () => {
  let controller: TrainingRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingRequestController],
      providers: [TrainingRequestService],
    }).compile();

    controller = module.get<TrainingRequestController>(TrainingRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
