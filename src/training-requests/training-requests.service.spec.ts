import { Test, TestingModule } from '@nestjs/testing';
import { TrainingRequestService } from './training-request.service';

describe('TrainingRequestService', () => {
  let service: TrainingRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingRequestService],
    }).compile();

    service = module.get<TrainingRequestService>(TrainingRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
