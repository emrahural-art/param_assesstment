import { db } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { type CreateCandidateInput } from "./types";

export async function createCandidate(input: CreateCandidateInput) {
  return db.candidate.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      resumeUrl: input.resumeUrl,
      cvData: input.cvData ? (input.cvData as Prisma.InputJsonValue) : Prisma.JsonNull,
      consentAt: input.consentAt ?? new Date(),
    },
  });
}

export async function updateCandidate(id: string, input: Record<string, unknown>) {
  const { cvData, ...rest } = input;
  return db.candidate.update({
    where: { id },
    data: {
      ...rest,
      ...(cvData !== undefined && {
        cvData: cvData ? (cvData as Prisma.InputJsonValue) : Prisma.JsonNull,
      }),
    },
  });
}

export async function deleteCandidate(id: string) {
  return db.candidate.delete({ where: { id } });
}

export async function anonymizeCandidate(id: string) {
  return db.candidate.update({
    where: { id },
    data: {
      firstName: "Anonim",
      lastName: "Kullanıcı",
      email: `anonymized-${id}@deleted.local`,
      phone: null,
      resumeUrl: null,
      cvData: Prisma.JsonNull,
      status: "ANONYMIZED",
    },
  });
}
