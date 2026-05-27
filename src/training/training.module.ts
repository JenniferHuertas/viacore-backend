import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingRepository } from './training.repository';
import { Training } from './entities/training.entity';
import { FileResourceModule } from 'src/file-resource/file-resource.module';
import { FileResource } from 'src/file-resource/entities/file-resource.entity';
import { TrainingRequests } from '../training-requests/entities/training-request.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, FileResource, TrainingRequests]),
    FileResourceModule,
    NotificationsModule,
  ],
  controllers: [TrainingController],
  providers: [TrainingService, TrainingRepository],
  exports: [TrainingService],
})
export class TrainingModule {}
