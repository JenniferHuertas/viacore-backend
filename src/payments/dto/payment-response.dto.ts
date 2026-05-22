export class PaymentUserDto {
  id!: string;
  name!: string;
  email!: string;
  companyName?: string;
  role?: string;
}

export class PaymentResponseDto {
  id!: string;
  amount!: number;
  status!: string;
  paymentMethod?: string;
  mercadoPagoId?: string;
  createdAt!: Date;
  updatedAt?: Date;
  user!: PaymentUserDto;
}

export class CreatePreferenceResponseDto {
  paymentId!: string;
  init_point?: string;
}

export class WebhookResponseDto {
  received!: boolean;
  message?: string;
}
