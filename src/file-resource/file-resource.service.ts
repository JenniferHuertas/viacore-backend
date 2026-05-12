import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileResource } from './entities/file-resource.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
//import { Training } from '../training/training.entity';
//import { TrainingRequest } from '../training-request/training-request.entity';

@Injectable()
export class FileResourceService {
  constructor(
    @InjectRepository(FileResource)
    private readonly fileRepository: Repository<FileResource>,

    /*    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,

    @InjectRepository(TrainingRequest)
    private readonly trainingRequestRepository: Repository<TrainingRequest>,
*/
  ) {}

  // SUBIDA CLOUDINARY (BUFFER → STREAM)
  private uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'file-resources',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async upload(file: Express.Multer.File, dto: UploadFileDto) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    /*    if (!dto.trainingId && !dto.trainingRequestId) {
      throw new BadRequestException(
        'File must be linked to Training or TrainingRequest',
      );
    }

    let training: Training = null;
    let trainingRequest: TrainingRequest = null;

    if (dto.trainingId) {
      training = await this.trainingRepository.findOne({
        where: { id: dto.trainingId },
      });

      if (!training) {
        throw new BadRequestException('Training not found');
      }
    }

    if (dto.trainingRequestId) {
      trainingRequest = await this.trainingRequestRepository.findOne({
        where: { id: dto.trainingRequestId },
      });

      if (!trainingRequest) {
        throw new BadRequestException('TrainingRequest not found');
      }
    }
*/
    // SUBIDA A CLOUDINARY
    const uploadResult = await this.uploadToCloudinary(file);

    // GUARDAR EN DB
    const fileResource = this.fileRepository.create({
      title: dto.title,
      fileUrl: uploadResult.secure_url,
      fileType: uploadResult.resource_type,
      //      training,
      //      trainingRequest,
    });

    return this.fileRepository.save(fileResource);
  }

  //Carga de archivos desde otro modulo
  async uploadForEntity(
    file: Express.Multer.File,
    parentType: 'training' | 'trainingRequest',
    parentId: string,
    title = 'Archivo adjunto',
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!parentType || !parentId) {
      throw new BadRequestException('parentType and parentId are required');
    }

    // SUBIDA A CLOUDINARY (MISMO MÉTODO)
    const uploadResult = await this.uploadToCloudinary(file);

    // CREACIÓN BASE
    const fileResource = this.fileRepository.create({
      title,
      fileUrl: uploadResult.secure_url,
      fileType: uploadResult.resource_type,
    });

    // ASOCIACIÓN DINÁMICA (SIN USAR REPOS)
    if (parentType === 'training') {
      fileResource.training = { id: parentId } as any;
    }

    /*    if (parentType === 'trainingRequest') {
      fileResource.trainingRequestId = parentId;
    }
*/
    return this.fileRepository.save(fileResource);
  }

   //fincion para seeder de training
  async createFromUrl(params: {
  url: string;
  parentType: 'training' | 'trainingRequest';
  parentId: string;
  title: string;
  }) {
    const fileResource = this.fileRepository.create({
      fileUrl: params.url,
      title: params.title,
      training: { id: params.parentId },
      fileType: "image"
    });

    return this.fileRepository.save(fileResource);
  }
}
