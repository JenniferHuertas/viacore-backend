import { MeetingSlot } from '../interfaces/meeting-slot.interface';
import {
  END_HOUR,
  LAST_AVAILABLE_HOUR,
  LAST_AVAILABLE_MINUTE,
  MEETING_DURATION,
  START_HOUR,
} from './meeting.constants';
import { addMinutesToDate } from './date.utils';

export const generateDaySlots = (
  date: Date,
  timezone: string,
): MeetingSlot[] => {
  const slots: MeetingSlot[] = [];

  // Construimos el inicio del día en el timezone del usuario
  const dateStr = date.toLocaleDateString('en-CA'); // "YYYY-MM-DD"
  const startStr = `${dateStr}T${String(START_HOUR).padStart(2, '0')}:00:00`;

  // Convertimos esa hora local a UTC usando el timezone
  const naiveDate = new Date(startStr);
  const tzFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = tzFormatter.formatToParts(naiveDate);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0');

  const utcEquivalent = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );

  const offsetMs = naiveDate.getTime() - utcEquivalent;
  const current = new Date(naiveDate.getTime() + offsetMs);

  while (true) {
    const start = new Date(current);
    const end = addMinutesToDate(start, MEETING_DURATION);

    // Verificamos hora local en el timezone del usuario
    const localParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(start);

    const localHour = parseInt(localParts.find((p) => p.type === 'hour')?.value ?? '0');
    const localMinute = parseInt(localParts.find((p) => p.type === 'minute')?.value ?? '0');

    if (
      localHour > LAST_AVAILABLE_HOUR ||
      (localHour === LAST_AVAILABLE_HOUR && localMinute > LAST_AVAILABLE_MINUTE)
    ) {
      break;
    }

    const endLocalParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).formatToParts(end);

    const endLocalHour = parseInt(endLocalParts.find((p) => p.type === 'hour')?.value ?? '0');

    if (endLocalHour > END_HOUR) {
      break;
    }

    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(start);

    slots.push({ start, end, formatted });

    current.setTime(current.getTime() + MEETING_DURATION * 60000);
  }

  return slots;
};
