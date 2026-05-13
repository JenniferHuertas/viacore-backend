import type { TrainingRequests } from "../entities/training-request.entity";

export interface PaginatedTrainingRequests {
  data: TrainingRequests[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}