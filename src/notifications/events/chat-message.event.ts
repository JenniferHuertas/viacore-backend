export class ChatMessageEvent {
  constructor(
    public readonly senderId: string,

    public readonly receiverId: string,

    public readonly senderName: string,

    public readonly message: string,
  ) {}
}