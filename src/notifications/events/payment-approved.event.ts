export class PaymentApprovedEvent {
  constructor(
    public readonly userId: string,

    public readonly email: string,

    public readonly fullName: string,

    public readonly paymentId: string,

    public readonly amount: number,
  ) {}
}