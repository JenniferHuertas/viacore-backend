import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
  ParseEnumPipe,
  ParseUUIDPipe,
  Delete,
  UseInterceptors,
  UploadedFile,
  SerializeOptions,
  ClassSerializerInterceptor,
  ForbiddenException,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { memoryStorage } from 'multer';

import { TrainingRequestService } from './training-request.service';

import { FileResourceService } from '../file-resource/file-resource.service';

import { EmailService } from '../notifications/channels/email/email.service';

import { AuthGuard } from '../auth/guards/auth.guard';

import { RolesGuard } from 'src/auth/guards/roles.guard';

import { Roles } from 'src/decorator/roles.decorator';

import type { RequestWithUsers } from './interfaces/requests-payloads.interfaces';

import type { PaginatedTrainingRequests } from './interfaces/requests-results.interface';

import type { IUpdateTrainingRequest } from './interfaces/requests-data.interfaces';

import { Role } from '../users/enums/roles.enum';

import { RequestStatus } from './enums/requests-status.enum';

import { TrainingRequests } from './entities/training-request.entity';

import { CreateTrainingRequestDto } from './dto/create-training-request.dto';

import { UpdateTrainingRequestDto } from './dto/update-training-request.dto';

import { ChangeStatusDto } from './dto/status-training-request.dto';

@ApiTags('Training Requests')
@ApiBearerAuth('Bearer')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ groups: ['Get'] })
@Controller('training-requests')
export class TrainingRequestController {
  constructor(
    private readonly trainingRequestService: TrainingRequestService,

    private readonly fileService: FileResourceService,

    private readonly emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crea una nueva solicitud de capacitación',
  })
  @ApiResponse({
    status: 201,
    description: 'La solicitud ha sido creada con éxito.',
  })
  async create(
    @Body()
    createTrainingRequestDto: CreateTrainingRequestDto,

    @Req()
    req: RequestWithUsers,
  ): Promise<TrainingRequests> {
    if (!req.user.profileCompleted) {
      throw new ForbiddenException(
        'Debes completar tu perfil antes de crear solicitudes.',
      );
    }

    const userId = req.user.id;

    const requestInput = {
      trainingId: createTrainingRequestDto.trainingId,

      participantsCount: createTrainingRequestDto.participantsCount,

      objectives: createTrainingRequestDto.objectives,

      context: createTrainingRequestDto.context,

      training: {
        id: createTrainingRequestDto.trainingId,
      },
    };

    return await this.trainingRequestService.create(requestInput, userId);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Obtiene las solicitudes del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitudes del usuario obtenidas con éxito.',
  })
  async findMyRequests(
    @Req()
    req: RequestWithUsers,
  ) {
    if (!req.user.profileCompleted) {
      throw new ForbiddenException(
        'Debes completar tu perfil para acceder a esta sección.',
      );
    }

    const userId = req.user.id;

    return await this.trainingRequestService.findMyRequests(userId);
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Obtener todas las solicitudes (Solo Admin)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Número de página (ej. 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Límite por página (ej. 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RequestStatus,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes obtenida con éxito.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido. Se requiere rol de Admin.',
  })
  async findAll(
    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,

    @Query(
      'status',
      new ParseEnumPipe(RequestStatus, {
        optional: true,
      }),
    )
    status?: RequestStatus,
  ): Promise<PaginatedTrainingRequests> {
    const pageNumber = page ? parseInt(page, 10) : 1;

    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return await this.trainingRequestService.findAll(
      pageNumber,
      limitNumber,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtiene una solicitud de capacitación por id',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud encontrada.',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: RequestWithUsers,
  ): Promise<TrainingRequests> {
    if (!req.user.profileCompleted) {
      throw new ForbiddenException(
        'Debes completar tu perfil para acceder a esta sección.',
      );
    }

    return await this.trainingRequestService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualiza una solicitud de capacitación',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud actualizada con éxito.',
  })
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateTrainingRequestDto: UpdateTrainingRequestDto,

    @Req()
    req: RequestWithUsers,
  ): Promise<TrainingRequests> {
    if (!req.user.profileCompleted) {
      throw new ForbiddenException(
        'Debes completar tu perfil antes de modificar solicitudes.',
      );
    }

    const requestInput: IUpdateTrainingRequest = {};

    if (updateTrainingRequestDto.participantsCount !== undefined) {
      requestInput.participantsCount =
        updateTrainingRequestDto.participantsCount;
    }

    if (updateTrainingRequestDto.objectives !== undefined) {
      requestInput.objectives = updateTrainingRequestDto.objectives;
    }

    if (updateTrainingRequestDto.context !== undefined) {
      requestInput.context = updateTrainingRequestDto.context;
    }

    if (updateTrainingRequestDto.trainingId !== undefined) {
      requestInput.training = {
        id: updateTrainingRequestDto.trainingId,
      };
    }

    return await this.trainingRequestService.update(id, requestInput, req.user);
  }

  @Patch(':id/status')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Actualizar el estado de una solicitud (Solo Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la solicitud.',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    changeStatusDto: ChangeStatusDto,
  ): Promise<TrainingRequests> {
    return await this.trainingRequestService.updateStatus(
      id,
      changeStatusDto.status,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Elimina lógicamente una solicitud (Soft Delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud eliminada con éxito.',
  })
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: RequestWithUsers,
  ) {
    if (!req.user.profileCompleted) {
      throw new ForbiddenException(
        'Debes completar tu perfil antes de eliminar solicitudes.',
      );
    }

    return await this.trainingRequestService.remove(id, req.user);
  }

  @Post(':id/upload-evidence')
  @ApiOperation({
    summary: 'Sube un archivo (PDF/Excel) y lo adjunta a la solicitud',
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido y vinculado exitosamente.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',

      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },

        title: {
          type: 'string',
          example: 'Comprobante de pago',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),

      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async uploadEvidence(
    @Param('id', ParseUUIDPipe)
    id: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Body('title')
    title?: string,

    @Req()
    req?: RequestWithUsers,
  ) {
    if (req && !req.user.profileCompleted) {
      throw new ForbiddenException(
        'Debes completar tu perfil antes de subir archivos.',
      );
    }

    const request = await this.trainingRequestService.findOne(id);

    const decodedName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const finalTitle = (title || decodedName).toLowerCase().endsWith('.pdf')
      ? title || decodedName
      : `${title || decodedName}.pdf`;

    const savedFile = await this.fileService.uploadForEntity(
      file,
      'trainingRequest',
      id,
      finalTitle,
    );

    if (request.user?.email) {
      await this.emailService.sendNewMaterialAvailable(
        request.user.email,
        request.user.name,
        finalTitle,
        savedFile.emailUrl,
      );
    }

    return {
      message: 'Archivo vinculado correctamente',

      file: savedFile,
    };
  }
}
