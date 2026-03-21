import { type Candidate } from "@/generated/prisma/client";
import { type CandidateDTO } from "./types";

export function toCandidateDTO(candidate: Candidate): CandidateDTO {
  return {
    id: candidate.id,
    fullName: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone,
    resumeUrl: candidate.resumeUrl,
    status: candidate.status,
    appliedAt: candidate.createdAt.toISOString(),
  };
}

export function toCandidateDTOList(candidates: Candidate[]): CandidateDTO[] {
  return candidates.map(toCandidateDTO);
}
