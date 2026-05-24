export const addMinutesToDate = (
  date: Date,
  minutes: number,
): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const formatHour = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};