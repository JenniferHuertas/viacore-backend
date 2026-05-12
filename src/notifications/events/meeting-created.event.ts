export class MeetingCreatedEvent {
  constructor(
    public readonly userId: string,

    public readonly title: string,

    public readonly meetingId: string,

    public readonly meetingDate: Date,

    public readonly meetingLink?: string,
  ) {}
}