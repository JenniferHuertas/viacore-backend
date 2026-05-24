import { MeetingSlot } from '../interfaces/meeting-slot.interface';

import {
  END_HOUR,
  LAST_AVAILABLE_HOUR,
  LAST_AVAILABLE_MINUTE,
  MEETING_DURATION,
  START_HOUR,
} from './meeting.constants';

import {
  addMinutesToDate,
  formatHour,
} from './date.utils';

export const generateDaySlots = (
  date: Date,
): MeetingSlot[] => {
  const slots: MeetingSlot[] = [];

  const current = new Date(date);

  current.setHours(
    START_HOUR,
    0,
    0,
    0,
  );

  while (true) {
    const start = new Date(current);

    const end = addMinutesToDate(
      start,
      MEETING_DURATION,
    );

    if (
      start.getHours() >
        LAST_AVAILABLE_HOUR ||
      (start.getHours() ===
        LAST_AVAILABLE_HOUR &&
        start.getMinutes() >
          LAST_AVAILABLE_MINUTE)
    ) {
      break;
    }

    if (end.getHours() > END_HOUR) {
      break;
    }

    slots.push({
      start,
      end,
      formatted: formatHour(start),
    });

    current.setMinutes(
      current.getMinutes() +
        MEETING_DURATION,
    );
  }

  return slots;
};