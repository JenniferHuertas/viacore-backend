import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TrainingRequestRepository } from './repositories/training-request.repository';

import { TrainingRequests } from './entities/training-request.entity';

import { RequestStatus } from './enums/requests-status.enum';

import type { PaginatedTrainingRequests } from './interfaces/requests-results.interface';

import type {
  ICreateTrainingRequest,
  IUpdateTrainingRequest,
} from './interfaces/requests-data.interfaces';

import { Users } from '../users/entities/user.entity';

import { Role } from 'src/auth/roles.enum';

import type { UserPayloads } from './interfaces/requests-payloads.interfaces';

import { EmailService } from 'src/notifications/channels/email/email.service';

import { NotificationsService } from 'src/notifications/notifications.service';

import { NotificationType } from 'src/notifications/enums/notification-type.enum';

import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';

@Injectable()
export class TrainingRequestService {
  constructor(
    private readonly repository: TrainingRequestRepository,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    private readonly emailService: EmailService,

    private readonly notificationsService: NotificationsService,

    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    data: ICreateTrainingRequest,
    userId: string,
  ): Promise<TrainingRequests> {
    let price = 0;

    if (data.participantsCount <= 10) {
      price = 250000;
    } else if (data.participantsCount <= 20) {
      price = 500000;
    } else if (data.participantsCount <= 50) {
      price = 1000000;
    } else {
      price = 1500000;
    }

    const newRequest =
      await this.repository.createRequests({
        ...data,

        estimatedPrice: price,

        user: { id: userId },
      });

    const user =
      await this.usersRepository.findOneBy({
        id: userId,
      });

    if (user) {
      await this.emailService.sendTrainingRequestCreated(
        user.email,
        user.companyName || user.name,
      );
    }

    return newRequest;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: RequestStatus,
  ): Promise<PaginatedTrainingRequests> {
    const skip = (page - 1) * limit;

    const [requests, total] =
      await this.repository.findAllRequests(
        skip,
        limit,
        status,
      );

    return {
      data: requests,

      meta: {
        totalItems: total,

        itemCount: requests.length,

        itemsPerPage: limit,

        totalPages: Math.ceil(
          total / limit,
        ),

        currentPage: page,
      },
    };
  }

  async findOne(
    id: string,
  ): Promise<TrainingRequests> {
    const request =
      await this.repository.findRequestById(
        id,
      );

    if (!request) {
      throw new NotFoundException(
        `Solicitud con ID ${id} no encontrada`,
      );
    }

    return request;
  }

  async findMyRequests(
    userId: string,
  ): Promise<TrainingRequests[]> {
    return await this.repository.findMyRequests(
      userId,
    );
  }

  async update(
    id: string,
    data: IUpdateTrainingRequest,
    currentUser: UserPayloads,
  ): Promise<TrainingRequests> {
    const existingRequest =
      await this.findOne(id);

    if (
      currentUser.role !== Role.Admin &&
      existingRequest.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para editar esta solicitud.',
      );
    }

    if (
      currentUser.role !== Role.Admin &&
      existingRequest.status !==
        RequestStatus.PENDING &&
      existingRequest.status !==
        RequestStatus.IN_REVIEW
    ) {
      throw new BadRequestException(
        `No se puede modificar esta solicitud porque su estado actual es 
        "${existingRequest.status}". Si necesitas realizar cambios, por favor
        crea una nueva solicitud.`,
      );
    }

    const updatePayload:
      IUpdateTrainingRequest & {
        estimatedPrice?: number;
      } = {
      ...data,
    };

    if (
      data.participantsCount &&
      data.participantsCount !==
        existingRequest.participantsCount
    ) {
      let price = 0;

      if (data.participantsCount <= 10)
        price = 250000;
      else if (data.participantsCount <= 20)
        price = 500000;
      else if (data.participantsCount <= 50)
        price = 1000000;
      else price = 1500000;

      updatePayload.estimatedPrice =
        price;
    }

    const updatedRequest =
      await this.repository.updateRequest(
        id,
        updatePayload,
      );

    if (!updatedRequest) {
      throw new NotFoundException(`
        No se pudo encontrar la solicitud con ID ${id} para retornar los cambios.`,
      );
    }

    return updatedRequest;
  }

  async updateStatus(
    id: string,
    newStatus: RequestStatus,
  ): Promise<TrainingRequests> {
    const request = await this.findOne(id);
    if (request.status === RequestStatus.CANCELLED) {
      throw new BadRequestException('No se puede modificar una solicitud que ya fue cancelada.');
    }
    if (
      request.status ===
        RequestStatus.SCHEDULED &&
      newStatus !==
        RequestStatus.CANCELLED &&
      newStatus !==
        RequestStatus.AWAITING_PAYMENT
    ) {
      throw new BadRequestException(
        'La capacitación ya está agendada. Solo se permite cancelarla o pasarla a Esperando Pago.',
      );
    }
    if (
      newStatus === RequestStatus.PENDING &&
      request.status !== RequestStatus.PENDING
    ) {
      throw new BadRequestException('Una solicitud en proceso no puede regresar a estado Pendiente.');
    }
    request.status = newStatus;
    const updatedRequest =
      await this.repository.saveRequest(
        request,
      );

    this.sendStatusNotifications(
      updatedRequest,
      newStatus,
    ).catch((err) =>
      console.error(
        'Error enviando notificaciones:',
        err,
      ),
    );

    return updatedRequest;
  }

  private async sendStatusNotifications(
    request: TrainingRequests,
    newStatus: RequestStatus,
  ) {
    if (!request.user) return;

    if (request.user.email) {
      await this.sendStatusEmail(
        request,
        newStatus,
      );
    }

    if (request.user.id) {
      const notifConfig =
        this.getNotificationConfigForStatus(
          newStatus,
        );

      await this.notificationsService.create({
        type: notifConfig.type,
        userId: request.user.id,
        title: notifConfig.title,
        message: notifConfig.message,
      });

      this.notificationsGateway.emitNotificationToUser(
        request.user.id,
        {
          type: notifConfig.type,
          title: notifConfig.title,
          message: notifConfig.message,
          status: newStatus,
          requestId: request.id,
        },
      );
    }
  }

  private async sendStatusEmail(
    request: TrainingRequests,
    status: RequestStatus,
  ) {
    const companyName =
      request.user.companyName ||
      request.user.name;

    switch (status) {
      case RequestStatus.IN_REVIEW:
        await this.emailService.sendTrainingInReview(
          request.user.email,
          companyName,
        );
        break;

      case RequestStatus.AWAITING_PAYMENT:
        await this.emailService.sendTrainingAwaitingPayment(
          request.user.email,
          companyName,
        );
        break;

      case RequestStatus.SCHEDULED:
        await this.emailService.sendTrainingScheduled(
          request.user.email,
          companyName,
        );
        break;

      case RequestStatus.CONFIRMED:
        await this.emailService.sendTrainingConfirmed(
          request.user.email,
          companyName,
        );
        break;

      case RequestStatus.CANCELLED:
        await this.emailService.sendTrainingCancelled(
          request.user.email,
          companyName,
        );
        break;

      default:
        break;
    }
  }

  private getNotificationConfigForStatus(
    status: RequestStatus,
  ) {
    const configs = {
      [RequestStatus.IN_REVIEW]: {
        type:
          NotificationType.REQUEST_IN_REVIEW,

        title: 'Solicitud en revisión',

        message:
          'Tu solicitud está siendo evaluada por el equipo de ViaCore.',
      },

      [RequestStatus.AWAITING_PAYMENT]:
        {
          type:
            NotificationType.REQUEST_AWAITING_PAYMENT,

          title: 'Pago pendiente',

          message:
            'La capacitación fue aprobada y está esperando confirmación de pago.',
        },

      [RequestStatus.SCHEDULED]: {
        type:
          NotificationType.REQUEST_SCHEDULED,

        title: 'Capacitación agendada',

        message:
          'Tu capacitación fue agendada correctamente.',
      },

      [RequestStatus.CONFIRMED]: {
        type:
          NotificationType.REQUEST_CONFIRMED,

        title:
          'Capacitación confirmada',

        message:
          'Tu capacitación fue confirmada exitosamente.',
      },

      [RequestStatus.CANCELLED]: {
        type:
          NotificationType.REQUEST_CANCELLED,

        title:
          'Solicitud cancelada',

        message:
          'La solicitud fue cancelada.',
      },
    };

    return (
      configs[status] || {
        type:
          NotificationType.REQUEST_IN_REVIEW,

        title: 'Actualización',

        message: `El estado cambió a ${status}`,
      }
    );
  }

  async remove(
    id: string,
    currentUser: UserPayloads,
  ): Promise<{ message: string }> {
    const request =
      await this.findOne(id);

    if (
      currentUser.role !== Role.Admin &&
      request.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta solicitud.',
      );
    }

    if (
      currentUser.role !== Role.Admin &&
      request.status !==
        RequestStatus.PENDING
    ) {
      throw new BadRequestException(
        `No puedes eliminar esta solicitud porque su estado es 
        "${request.status}". Si necesitas cancelarla, contacta a soporte.`,
      );
    }

    await this.repository.softRemove(
      request,
    );

    return {
      message: `La solicitud con id ${id} ha sido eliminada correctamente.`,
    };
  }
}