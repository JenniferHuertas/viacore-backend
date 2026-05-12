export class TrainingRequestEvent {
  constructor(
    public readonly userId: string,

    public readonly trainingRequestId: string,

    public readonly status: string,

    public readonly trainingTitle?: string,
  ) {}
}