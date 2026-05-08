export enum RequestStatus {
  PENDING = 'pending',           // US135: Solicitud recién enviada por el usuario.
  SCHEDULED = 'scheduled',       // US136/138: Ya se agendó la reunión de diagnóstico inicial.
  IN_REVIEW = 'in_review',       // US147: El administrador está analizando la demanda o preparando la propuesta.
  AWAITING_PAYMENT = 'awaiting_payment', // US140: La propuesta fue enviada y se espera la seña de Mercado Pago.
  CONFIRMED = 'confirmed',       // US140/150: Pago realizado, el servicio está listo para iniciar.
  CANCELLED = 'cancelled'        // Solicitud rechazada por el admin o cancelada por el cliente.
}