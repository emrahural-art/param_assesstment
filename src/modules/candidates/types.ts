import { type Candidate, type CandidateStatus } from "@/generated/prisma/client";

export type CandidateDTO = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  status: CandidateStatus;
  appliedAt: string;
};

export type CreateCandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  cvData?: Record<string, unknown>;
  consentAt?: Date;
};

export type UpdateCandidateInput = Partial<CreateCandidateInput> & {
  status?: CandidateStatus;
};

export type CandidateFilters = {
  search?: string;
  status?: CandidateStatus;
  stage?: string;
  listingId?: string;
};

export type { Candidate };
