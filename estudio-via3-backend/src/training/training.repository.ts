import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Training } from './entities/training.entity';
import { Repository } from 'typeorm';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

@Injectable()
export class TrainingRepository {
  constructor(
    @InjectRepository(Training)
    private readonly trainingOrmRepository: Repository<Training>,
  ) {}

  async getAllTraining() {
    const training = await this.trainingOrmRepository.find({
      where: { isActive: true },
    });
    return training.map((training) => ({
      id: training.id,
      title: training.title,
      description: training.description,
      category: training.category,
      imgUrl: training.imgUrl,
    }));
  }

  async getTrainingById(id: string) {
    const training = await this.trainingOrmRepository.findOne({
      where: { id, isActive: true },
    });

    if (!training) {
      throw new NotFoundException(`Capacitación con id ${id} no encontrada`);
    }

    return training;
  }

  async createTraining(dataTraining: CreateTrainingDto) {
    const newTraining = this.trainingOrmRepository.create(dataTraining);

    return await this.trainingOrmRepository.save(newTraining);
  }

  async updateTraining(id: string, dataTraining: UpdateTrainingDto) {
    const training = await this.trainingOrmRepository.findOne({
      where: { id, isActive: true },
    });
    if (!training) {
      throw new NotFoundException(`Capacitación con id ${id} no encontrada`);
    }

    await this.trainingOrmRepository.update(id, dataTraining);
    return id;
  }

  async deleteTraining(id: string) {
    const training = await this.trainingOrmRepository.findOne({
      where: { id },
    });

    if (!training) {
      throw new NotFoundException(`Capacitación con id ${id} no encontrada`);
    }

    if (!training.isActive) {
      throw new BadRequestException(
        'La capacitación ya se encuentra desactivada',
      );
    }

    training.isActive = false;

    await this.trainingOrmRepository.save(training);

    return { message: `Capacitación con id ${id} desactivada correctamente` };
  }
}
