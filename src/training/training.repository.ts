import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Training } from './entities/training.entity';
import { In, Repository } from 'typeorm';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { SeedTraining } from './dto/seeder-training.dto';
import { FileResourceService } from 'src/file-resource/file-resource.service';
import { FileResource } from 'src/file-resource/entities/file-resource.entity';

@Injectable()
export class TrainingRepository {
  constructor(
    private readonly fileResourceService: FileResourceService,
    @InjectRepository(Training)
    private readonly trainingOrmRepository: Repository<Training>,
    @InjectRepository(FileResource)
    private readonly fileResourceOrmRepository: Repository<FileResource>,
  ) {}

  async getAllTraining() {
    const training = await this.trainingOrmRepository.find({
      where: { isActive: true },
      relations: {
        fileResource: true,
      },
    });
    return training.map((training) => ({
      id: training.id,
      fileResource: training.fileResource,
      title: training.title,
      shortDescription: training.shortDescription,
    }));
  }

  async getTrainingById(id: string) {
    const training = await this.trainingOrmRepository.findOne({
      where: { id, isActive: true },
      relations: { fileResource: true },
    });

    if (!training) {
      throw new NotFoundException(`Capacitación con id ${id} no encontrada`);
    }

    return {
      id: training.id,
      fileResource: training.fileResource,
      title: training.title,
      description: training.description,
      tagline: training.tagline,
      includes: training.includes,
    };
  }

  async createTraining(
    dataTraining: CreateTrainingDto,
    file?: Express.Multer.File,
  ) {
    const newTraining = await this.trainingOrmRepository.save(dataTraining);

    if (file) {
      await this.fileResourceService.uploadForEntity(
        file,
        'training',
        newTraining.id,
        `${dataTraining.title} - image`,
      );
    }

    return newTraining;
  }

  async addTraining(dataTrainings: SeedTraining[]) {
    const titles = dataTrainings.map((training) => training.title);

    const existingTrainings = await this.trainingOrmRepository.find({
      where: {
        title: In(titles),
      },
    });

    const existingTitles = existingTrainings.map((training) => training.title);

    const trainingToSave: Training[] = [];

    for (const dataTraining of dataTrainings) {
      if (existingTitles.includes(dataTraining.title)) continue;

      const newTraining = await this.trainingOrmRepository.save({
        title: dataTraining.title,
        shortDescription: dataTraining.shortDescription,
        description: dataTraining.description,
        tagline: dataTraining.tagline,
        includes: dataTraining.includes,
        category: dataTraining.category,
        imgUrl: dataTraining.imgUrl,
      });

      if (dataTraining.imgUrl) {
        await this.fileResourceService.createFromUrl({
          url: dataTraining.imgUrl,
          parentType: 'training',
          parentId: newTraining.id,
          title: `${newTraining.title} - image`,
        });
      }

      trainingToSave.push(newTraining);
    }

    if (!trainingToSave.length) {
      return [];
    }

    return trainingToSave;
  }

  async updateTraining(id: string, dataTraining: UpdateTrainingDto) {
    const training = await this.trainingOrmRepository.findOne({
      where: { id, isActive: true },
    });
    if (!training) {
      throw new NotFoundException(`Capacitación con id ${id} no encontrada`);
    }

    await this.trainingOrmRepository.update(id, dataTraining);
    return this.trainingOrmRepository.findOne({ where: { id } });
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
