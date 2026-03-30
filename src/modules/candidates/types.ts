import { type Candidate, type CandidateStatus, type Company } from "@/generated/prisma/client";

export type CandidateDTO = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  company: Company | null;
  position: string | null;
  department: string | null;
  status: CandidateStatus;
  appliedAt: string;
};

export type CreateCandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: Company;
  position?: string;
  department?: string;
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
  company?: Company;
  department?: string;
};

export type BulkCandidateRow = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  note?: string;
};

export type BulkCreateResult = {
  imported: number;
  skipped: number;
  errors: { row: number; email?: string; message: string }[];
};

export type { Candidate };
