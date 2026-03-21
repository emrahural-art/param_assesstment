import { type ApplicationStage } from "@/generated/prisma/client";

export type PipelineStageDTO = {
  id: string;
  name: string;
  order: number;
  color: string;
  candidateCount: number;
};

export type MoveApplicationInput = {
  applicationId: string;
  newStage: ApplicationStage;
};

export type { ApplicationStage };
