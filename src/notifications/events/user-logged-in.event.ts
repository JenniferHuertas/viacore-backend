export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,

    public readonly email: string,

    public readonly fullName: string,

    public readonly ipAddress?: string,

    public readonly device?: string,
  ) {}
}