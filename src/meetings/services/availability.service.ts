import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Meetings } from '../entities/meeting.entity';

import { WORKING_DAYS } from '../utils/meeting.constants';

import { generateDaySlots } from '../utils/slot.utils';

import { MeetingStatus } from '../entities/meetingStatus.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Meetings)
    private readonly meetingRepository: Repository<Meetings>,
  ) {}

  async getAvailability(date: string) {
    const targetDate = new Date(date);

    const day = targetDate.getDay();

    if (!WORKING_DAYS.includes(day)) {
      return [];
    }

    const slots = generateDaySlots(targetDate);

    const meetings = await this.meetingRepository.find({
      where: {
        status: Not(MeetingStatus.CANCELLED),
      },
    });

    const now = new Date();

    const minAvailableTime = new Date(
      now.getTime() + 30 * 60000,
    );

    return slots.filter((slot) => {
      if (slot.start <= minAvailableTime) {
        return false;
      }

      const occupied = meetings.some(
        (meeting) =>
          new Date(meeting.startTime).getTime() ===
          slot.start.getTime(),
      );

      return !occupied;
    });
  }
}