export interface ICreateTrainingRequest {
  trainingId: string;
  participantsCount: number;
  objectives: string;
  context: string;
  training: {
    id: string;
  };
}

export interface IUpdateTrainingRequest extends Partial<ICreateTrainingRequest> {}
