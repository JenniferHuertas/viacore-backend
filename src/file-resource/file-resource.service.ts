import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FileResource } from './entities/file-resource.entity';

import { UploadFileDto } from './dto/upload-file.dto';

import { v2 as cloudinary } from 'cloudinary';

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

  // SUBIDA CLOUDINARY
  private async uploadToCloudinary(
    file: Express.Multer.File,
    resourceType: 'image' | 'raw' = 'raw',
  ): Promise<{ public_id: string; resource_type: string }> {
    try {
      const sanitizedFileName = file.originalname
        .replace(/\.pdf$/i, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '');

      return await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'file-resources',

          resource_type: resourceType,

          public_id: sanitizedFileName,

          use_filename: false,

          unique_filename: false,

          overwrite: true,
        },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error en Cloudinary: ${message}`);
    }
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

    // URL FINAL PARA DESCARGA DIRECTA
    const cleanTitle = (dto.title || 'archivo').replace(/\.pdf$/i, '');

    const downloadUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'raw',
      secure: true,
      flags: `attachment:${cleanTitle}.pdf`,
    });

    // GUARDAR EN DB
    const fileResource = this.fileRepository.create({
      title: dto.title,

      fileUrl: downloadUrl,

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
  ): Promise<FileResource & { emailUrl: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!parentType || !parentId) {
      throw new BadRequestException('parentType and parentId are required');
    }

    // SUBIDA A CLOUDINARY
    const uploadResult: { public_id: string; resource_type: string } =
      await this.uploadToCloudinary(
        file,
        parentType === 'training' ? 'image' : 'raw',
      );

    // URL FINAL PARA DESCARGA DIRECTA

    const downloadUrl =
      parentType === 'training'
        ? cloudinary.url(uploadResult.public_id, {
            resource_type: 'image',
            secure: true,
          })
        : cloudinary.url(uploadResult.public_id, {
            resource_type: 'raw',
            secure: true,
          });

    // CREACIÓN BASE
    const fileResource = this.fileRepository.create({
      title,

      fileUrl: downloadUrl,

      fileType: uploadResult.resource_type,
    });

    // ASOCIACIÓN DINÁMICA (SIN USAR REPOS)
    if (parentType === 'training') {
      fileResource.training = {
        id: parentId,
      } as unknown as FileResource['training'];
    }

    if (parentType === 'trainingRequest') {
      fileResource.trainingRequestId = parentId;
    }

    const saved = await this.fileRepository.save(fileResource);

    const emailUrl =
      parentType === 'trainingRequest'
        ? cloudinary.url(uploadResult.public_id, {
            resource_type: 'raw',
            secure: true,
            flags: 'attachment',
          })
        : saved.fileUrl;

    return { ...saved, emailUrl };
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

      training: {
        id: params.parentId,
      },

      fileType: 'image',
    });

    return this.fileRepository.save(fileResource);
  }
}
