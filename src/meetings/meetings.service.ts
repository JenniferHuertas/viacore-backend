import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Meetings } from './entities/meeting.entity';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

import { MeetingStatus } from './entities/meetingStatus.entity';

import { CalendlyService } from 'src/calendly/calendly.service';

import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meetings)
    private readonly meetingsRepository: Repository<Meetings>,

    private readonly calendlyService: CalendlyService,
    private readonly notificationsGateway: NotificationsGateway,
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

  async create(createMeetingDto: CreateMeetingDto) {
    // Se agrega await para asegurar que la validación termine
    // antes de continuar con la creación de la reunión.
    await this.validarFechaYHora(createMeetingDto);

    const { targetUserId, ...meetingData } = createMeetingDto;

    const startDate = new Date(
      `${createMeetingDto.date}T${createMeetingDto.time}:00`,
    );

    const endDate = new Date(startDate);

    // Se define una duración fija de 30 minutos
    // para mantener el flujo simple y estable.
    endDate.setMinutes(endDate.getMinutes() + 30);

    // Calendly será el proveedor principal de reuniones.
    // Aquí se genera dinámicamente el scheduling link.
    const calendlyEvent = await this.calendlyService.createOneOffEvent({
      name: 'Reunión Empresarial',

      startTime: startDate.toISOString(),

      endTime: endDate.toISOString(),

      // Temporalmente se usan datos mock mientras
      // se conecta el sistema real de usuarios.
      guestEmail: 'cliente@viacore.com',

      guestName: 'Cliente Viacore',
    });

    const newMeeting = this.meetingsRepository.create({
      ...meetingData,

      user: { id: targetUserId },

      // Se almacena únicamente el scheduling URL.
      // No se guarda el objeto completo de Calendly.
      schedulingUrl: calendlyEvent.scheduling_url,

      calendlyUri: calendlyEvent.uri,

      status: MeetingStatus.PENDING,
    });

    const saved = await this.meetingsRepository.save(newMeeting);

    this.notificationsGateway.emitNotificationToAdmin({
      title: 'Reunión agendada',
      message: 'Un usuario agendó una reunión',
      status: 'scheduled',
    });

    return saved;
  }

  async findAll() {
    return await this.meetingsRepository.find();
  }

  async findOne(id: string) {
    const meetingFound = await this.meetingsRepository.findOneBy({
      id,
    });

    if (!meetingFound) {
      throw new NotFoundException(`La reunión con id ${id} no existe`);
    }

    return meetingFound;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto) {
    await this.findOne(id);

    await this.meetingsRepository.update({ id }, updateMeetingDto);

    return await this.findOne(id);
  }

  async cancel(id: string) {
    const meeting = await this.findOne(id);

    meeting.status = MeetingStatus.CANCELLED;

    await this.meetingsRepository.save(meeting);

    return {
      message: 'Reunión cancelada correctamente',
    };
  }

  async validarFechaYHora(createMeetingDto: CreateMeetingDto) {
    const meetings = await this.meetingsRepository.findBy({
      date: createMeetingDto.date,
    });

    // Se usa throw porque retornar la excepción no detiene
    // la ejecución del flujo en NestJS.
    if (meetings.some((meeting) => meeting.time === createMeetingDto.time)) {
      throw new ConflictException('Ya existe una reunión en este horario');
    }
  }

  async findDisponibilidad(fecha: string) {
    const meetings = await this.meetingsRepository.findBy({
      date: new Date(fecha),
    });

    // Se corrige la lógica de disponibilidad.
    // Ahora el endpoint devuelve horarios libres
    // y no los horarios ocupados.
    const availableHours = this.horarios.filter(
      (hour) => !meetings.some((m) => m.time === hour),
    );

    return availableHours;
  }
}
