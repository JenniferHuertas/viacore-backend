import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Meetings } from './entities/meeting.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';
import { MeetingStatus } from './entities/meetingStatus.entity';
import { TrainingRequests } from 'src/training-requests/entities/training-request.entity';
import { RequestStatus } from 'src/training-requests/enums/requests-status.enum';
import { Users } from '../users/entities/user.entity';
import { EmailService } from 'src/notifications/channels/email/email.service';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meetings)
    private readonly meetingsRepository: Repository<Meetings>,

    @InjectRepository(
      TrainingRequests,
    )
    private readonly trainingRequestsRepository: Repository<TrainingRequests>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    private readonly emailService: EmailService,
  ) {}

  horarios = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
  ];

  async create(
    createMeetingDto: CreateMeetingDto,
  ) {
    await this.validarFechaYHora(
      createMeetingDto,
    );

    const request =
      await this.trainingRequestsRepository.findOne(
        {
          where: {
            id: createMeetingDto.trainingRequestId,
          },
        },
      );

    if (!request) {
      throw new NotFoundException(
        'Solicitud no encontrada',
      );
    }
    const userExists = await this.meetingsRepository.manager.getRepository(Users).findOne({
      where: { id: createMeetingDto.targetUserId }
    });
    if (!userExists) {
      throw new NotFoundException(`El usuario con ID ${createMeetingDto.targetUserId} no existe.`);
    }

    const newMeetingData = {
      date: createMeetingDto.date,

      time: createMeetingDto.time,

      link:
        'https://meet.google.com/geq-wgxn-gsz',

      user: {
        id: createMeetingDto.targetUserId,
      },

      trainingRequest: {
        id: createMeetingDto.trainingRequestId,
      },
    };

    const meeting =
      await this.meetingsRepository.save(
        newMeetingData,
      );

    request.status =
      RequestStatus.SCHEDULED;

    await this.trainingRequestsRepository.save(
      request,
    );

    const user =
      await this.usersRepository.findOneBy({
        id: createMeetingDto.targetUserId,
      });

    if (user) {
      await this.emailService.sendMeetingCreated(
        user.email,

        user.companyName ||
          user.name,

        `${createMeetingDto.date} ${createMeetingDto.time}`,

        meeting.link,
      );
    }

    return meeting;
  }

  async findAll() {
    return await this.meetingsRepository.find(
      {
        relations: [
          'user',
          'trainingRequest',
          'trainingRequest.training',
        ],
      },
    );
  }

  async findOne(id: string) {
    const meetingFound =
      await this.meetingsRepository.findOne(
        {
          where: {
            id: id,
          },

          relations: [
            'user',
            'trainingRequest',
            'trainingRequest.training',
          ],
        },
      );

    if (!meetingFound)
      throw new NotFoundError(
        `La reunion con id: ${id} no existe`,
      );

    return meetingFound;
  }

  async update(
    id: string,
    updateMeetingDto: UpdateMeetingDto,
  ) {
    return await this.meetingsRepository.update(
      { id: id },
      updateMeetingDto,
    );
  }

  async cancel(id: string) {
    const meeting: Meetings =
      await this.findOne(id);

    meeting.status =
      MeetingStatus.Cancelada;

    return await this.meetingsRepository.save(
      meeting,
    );
  }

  async validarFechaYHora(
    createMeetingDto: CreateMeetingDto,
  ) {
    const meetings =
      await this.meetingsRepository.findBy(
        {
          date: createMeetingDto.date,
        },
      );

    if (
      meetings.some(
        (meeting) =>
          meeting.time ===
          createMeetingDto.time,
      )
    ) {
      throw new ConflictException(
        `Ya existe una reunion en este horario`,
      );
    }
  }

  async findDisponibilidad(
    fecha: Date,
  ) {
    const meetings =
      await this.meetingsRepository.findBy(
        {
          date: fecha,
        },
      );

    const newHorarios =
      this.horarios.filter(
        (meeting) =>
          !meetings.some(
            (m) =>
              m.time == meeting,
          ),
      );

    return newHorarios;
  }
}