import { Module } from '@nestjs/common';
import { FileResourceService } from './file-resource.service';
import { FileResourceController } from './file-resource.controller';
import { CloudinaryConfig } from 'src/config/cloudinary';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileResource } from './entities/file-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileResource])],
  controllers: [FileResourceController],
  providers: [FileResourceService,CloudinaryConfig],
  exports:[FileResourceService]
})
export class FileResourceModule {}
