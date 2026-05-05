import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrainingRequestService } from './training-request.service';
import { CreateTrainingRequestDto } from './dto/create-training-request.dto';
import { UpdateTrainingRequestDto } from './dto/update-training-request.dto';

@Controller('training-request')
export class TrainingRequestController {
  constructor(private readonly trainingRequestService: TrainingRequestService) {}

  @Post()
  create(@Body() createTrainingRequestDto: CreateTrainingRequestDto) {
    return this.trainingRequestService.create(createTrainingRequestDto);
  }

  @Get()
  findAll() {
    return this.trainingRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrainingRequestDto: UpdateTrainingRequestDto) {
    return this.trainingRequestService.update(+id, updateTrainingRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingRequestService.remove(+id);
  }
}
