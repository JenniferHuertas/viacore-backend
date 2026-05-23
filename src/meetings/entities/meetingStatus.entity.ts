// Se cambia enum numérico a string enum.
// Esto evita inconsistencias en base de datos y facilita debugging.
export enum MeetingStatus {
  CONFIRMED = 'Confirmada',
  CANCELLED = 'Cancelada',
  PENDING = 'Pendiente',
}