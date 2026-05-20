import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ContactMessage } from './entities/contact.entity';

import { ContactDto } from './dto/contact.dto';

import { EmailService } from '../notifications/channels/email/email.service';

import { NotificationsService } from '../notifications/notifications.service';

import { NotificationsGateway } from '../notifications/gateways/notifications.gateway';

import { NotificationType } from '../notifications/enums/notification-type.enum';

import { Users } from '../users/entities/user.entity';

import { Role } from '../users/enums/roles.enum';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    private readonly emailService: EmailService,

    private readonly notificationsService: NotificationsService,

    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    data: ContactDto,
  ) {
    const newMessage =
      this.contactRepository.create(
        data,
      );

    const savedMessage =
      await this.contactRepository.save(
        newMessage,
      );

    try {
      await this.emailService.sendContactConfirmation(
        data.email,
        data.nombre,
      );
    } catch (error) {
      console.log(
        'ERROR ENVIANDO MAIL CONTACTO:',
        error,
      );
    }

    try {
      const admins =
        await this.usersRepository.find({
          where: {
            role: Role.Admin,
            isActive: true,
          },
        });

      for (const admin of admins) {
        const notification =
          await this.notificationsService.create(
            {
              title:
                'Nueva consulta recibida',

              message: `${data.nombre} envió una nueva consulta desde contacto.`,

              type:
                NotificationType.CONTACT_MESSAGE_CREATED,

              userId: admin.id,
            },
          );

        this.notificationsGateway.emitNotificationToUser(
          admin.id,
          notification,
        );
      }
    } catch (error) {
      console.log(
        'ERROR CREANDO NOTIFICACIÓN:',
        error,
      );
    }

    return savedMessage;
  }

  async findAll() {
    return await this.contactRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}