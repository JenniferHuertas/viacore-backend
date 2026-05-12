import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingRequestRepository } from './repositories/training-request.repository';

import { TrainingRequests } from './entities/training-request.entity';
import { RequestStatus } from './enums/requests-status.enum';
import type { PaginatedTrainingRequests } from './interfaces/requests-results.interface';
import type {
  ICreateTrainingRequest,
  IUpdateTrainingRequest
} from './interfaces/requests-data.interfaces';


@Injectable()
export class TrainingRequestService {
  constructor(
    private readonly repository: TrainingRequestRepository
  ) { }

  async create(
    data: ICreateTrainingRequest,
    userId: string
  ): Promise<TrainingRequests> {
    return await this.repository.createRequests({
      ...data,
      user: { id: userId }
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: RequestStatus
  ): Promise<PaginatedTrainingRequests> {
    const skip = (page - 1) * limit;
    const [requests, total] =
      await this.repository.findAllRequests(
        skip, limit, status
      );
    return {
      data: requests,
      meta: {
        totalItems: total,
        itemCount: requests.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(
    id: string
  ): Promise<TrainingRequests> {
    const request =
      await this.repository.findRequestById(id);
    if (!request) {
      throw new NotFoundException(
        `Solicitud con ID ${id} no encontrada`
      );
    }
    return request;
  }

  async findMyRequests(userId: string) {
    return await this.repository.findMyRequests(userId);
  }

  async update(
    id: string,
    data: IUpdateTrainingRequest,
  ): Promise<TrainingRequests> {
    const existingRequest = await this.findOne(id);
    if (existingRequest.status !== RequestStatus.PENDING && 
      existingRequest.status !== RequestStatus.IN_REVIEW) {
      throw new BadRequestException(
        `No se puede modificar esta solicitud porque su estado actual es 
        "${existingRequest.status}". Si necesitas realizar cambios, 
        por favor crea una nueva solicitud.`
      );
    }
    const updatedRequest = await this.repository.updateRequest(id, data);
    if (!updatedRequest) {
      throw new NotFoundException(`
        No se pudo encontrar la solicitud con ID ${id} para retornar los cambios.`
      );
    }
    return updatedRequest;
  }

  async updateStatus(
    id: string,
    newStatus: RequestStatus
  ): Promise<TrainingRequests> {
    const request = await this.findOne(id);
    if (request.status === RequestStatus.CANCELLED) {
      throw new BadRequestException('No se puede modificar una solicitud que ya fue cancelada.');
    }
    if (request.status === RequestStatus.SCHEDULED && newStatus !== RequestStatus.CANCELLED) {
      throw new BadRequestException('La capacitación ya está agendada. Solo se permite cancelarla.');
    }
    if (newStatus === RequestStatus.PENDING && request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Una solicitud en proceso no puede regresar a estado Pendiente.');
    }
    request.status = newStatus;
    // if (status === RequestStatus.CONFIRMED || status === RequestStatus.REJECTED) {
    //    await this.emailService.sendNotification(request.user.email, status);
    // }
    return await this.repository.saveRequest(request);
  }
}