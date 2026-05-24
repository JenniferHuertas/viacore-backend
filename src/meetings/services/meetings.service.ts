import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Not,
  Repository,
} from 'typeorm';

import { Meeting } from '../entities/meeting.entity';

import { CreateMeetingDto } from '../dto/create-meeting.dto';

import { RescheduleMeetingDto } from '../dto/reschedule-meeting.dto';

import { GoogleMeetService } from './google-meet.service';

import { TrainingRequests } from '../../training-request/entities/training-request.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,

    @InjectRepository(TrainingRequests)
    private readonly trainingRequestRepository: Repository<TrainingRequests>,

    private readonly googleMeetService: GoogleMeetService,
  ) {}

  async create(dto: CreateMeetingDto) {
    const trainingRequest =
      await this.trainingRequestRepository.findOne({
        where: {
          id: dto.trainingRequestId,
        },

        relations: [
          'user',
          'training',
        ],
      });

    if (!trainingRequest) {
      throw new NotFoundException(
        'Training request not found',
      );
    }

    const start = new Date(
      `${dto.date}T${dto.time}:00`,
    );

    const now = new Date();

    const minAllowedDate = new Date(
      now.getTime() + 30 * 60000,
    );

    if (start <= minAllowedDate) {
      throw new BadRequestException(
        'Meetings must be scheduled at least 30 minutes in advance',
      );
    }

    const day = start.getDay();

    if (day === 0 || day === 6) {
      throw new BadRequestException(
        'Weekends are not allowed',
      );
    }

    const hour = start.getHours();

    const minutes =
      start.getMinutes();

    const invalidHour =
      hour < 9 ||
      hour > 16 ||
      (hour === 16 && minutes > 30);

    if (invalidHour) {
      throw new BadRequestException(
        'Outside business hours',
      );
    }

    const validMinutes =
      minutes === 0 ||
      minutes === 30;

    if (!validMinutes) {
      throw new BadRequestException(
        'Only 30 minute intervals are allowed',
      );
    }

    const exists =
      await this.meetingRepository.findOne({
        where: {
          startTime: start,
          status: Not('CANCELLED'),
        },
      });

    if (exists) {
      throw new BadRequestException(
        'Slot already occupied',
      );
    }

    const end = new Date(
      start.getTime() + 30 * 60000,
    );

    const googleData =
      await this.googleMeetService.createEvent(
        {
          start,
          end,

          email:
            trainingRequest.user.email,

          name:
            trainingRequest.user.name,
        },
      );

    const meeting =
      this.meetingRepository.create({
        topic:
          dto.topic ||
          trainingRequest.training
            ?.title ||
          'Scheduled Meeting',

        startTime: start,

        endTime: end,

        meetLink:
          googleData.meetLink,

        googleEventId:
          googleData.googleEventId,

        status: 'CONFIRMED',

        reminderSent: false,

        user:
          trainingRequest.user,

        trainingRequest,
      });

    return await this.meetingRepository.save(
      meeting,
    );
  }

  async findAll() {
    return this.meetingRepository.find({
      relations: [
        'user',
        'trainingRequest',
      ],

      order: {
        startTime: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const meeting =
      await this.meetingRepository.findOne({
        where: { id },

        relations: [
          'user',
          'trainingRequest',
        ],
      });

    if (!meeting) {
      throw new NotFoundException(
        'Meeting not found',
      );
    }

    return meeting;
  }

  async cancel(id: string) {
    const meeting =
      await this.meetingRepository.findOne({
        where: { id },

        relations: [
          'user',
          'trainingRequest',
        ],
      });

    if (!meeting) {
      throw new NotFoundException(
        'Meeting not found',
      );
    }

    if (
      meeting.googleEventId
    ) {
      await this.googleMeetService.deleteEvent(
        meeting.googleEventId,
      );
    }

    meeting.status =
      'CANCELLED';

    return await this.meetingRepository.save(
      meeting,
    );
  }

  async reschedule(
    id: string,
    dto: RescheduleMeetingDto,
  ) {
    const meeting =
      await this.meetingRepository.findOne({
        where: { id },

        relations: [
          'user',
          'trainingRequest',
        ],
      });

    if (!meeting) {
      throw new NotFoundException(
        'Meeting not found',
      );
    }

    const newStart = new Date(
      dto.newStartTime,
    );

    const now = new Date();

    const minAllowedDate = new Date(
      now.getTime() + 30 * 60000,
    );

    if (
      newStart <= minAllowedDate
    ) {
      throw new BadRequestException(
        'Meetings must be rescheduled at least 30 minutes in advance',
      );
    }

    const day =
      newStart.getDay();

    if (day === 0 || day === 6) {
      throw new BadRequestException(
        'Weekends are not allowed',
      );
    }

    const hour =
      newStart.getHours();

    const minutes =
      newStart.getMinutes();

    const invalidHour =
      hour < 9 ||
      hour > 16 ||
      (hour === 16 &&
        minutes > 30);

    if (invalidHour) {
      throw new BadRequestException(
        'Outside business hours',
      );
    }

    const validMinutes =
      minutes === 0 ||
      minutes === 30;

    if (!validMinutes) {
      throw new BadRequestException(
        'Only 30 minute intervals are allowed',
      );
    }

    const occupied =
      await this.meetingRepository.findOne({
        where: {
          startTime: newStart,

          status:
            Not('CANCELLED'),

          id: Not(id),
        },
      });

    if (occupied) {
      throw new BadRequestException(
        'Slot already occupied',
      );
    }

    const newEnd = new Date(
      newStart.getTime() +
        30 * 60000,
    );

    if (
      meeting.googleEventId
    ) {
      await this.googleMeetService.deleteEvent(
        meeting.googleEventId,
      );
    }

    const googleData =
      await this.googleMeetService.createEvent(
        {
          start: newStart,
          end: newEnd,

          email:
            meeting.user.email,

          name:
            meeting.user.name,
        },
      );

    meeting.startTime =
      newStart;

    meeting.endTime =
      newEnd;

    meeting.meetLink =
      googleData.meetLink;

    meeting.googleEventId =
      googleData.googleEventId;

    meeting.status =
      'CONFIRMED';

    return await this.meetingRepository.save(
      meeting,
    );
  }
}