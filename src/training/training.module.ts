import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingRepository } from './training.repository';
import { Training } from './entities/training.entity';
import { FileResourceModule } from 'src/file-resource/file-resource.module';

@Module({
  imports: [TypeOrmModule.forFeature([Training]),FileResourceModule],
  controllers: [TrainingController],
  providers: [TrainingService, TrainingRepository],
  exports: [TrainingService],
})
export class TrainingModule {}
