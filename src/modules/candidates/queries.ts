import { db } from "@/lib/prisma";
import { type CandidateFilters } from "./types";
import { type Prisma } from "@/generated/prisma/client";

export async function getCandidates(filters?: CandidateFilters) {
  const where: Prisma.CandidateWhereInput = {};

  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.listingId) {
    where.applications = { some: { listingId: filters.listingId } };
  }

  if (filters?.stage) {
    where.applications = {
      ...where.applications,
      some: {
        ...(where.applications as Prisma.ApplicationListRelationFilter)?.some,
        stage: filters.stage as never,
      },
    };
  }

  return db.candidate.findMany({
    where,
    include: { applications: { include: { listing: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCandidateById(id: string) {
  return db.candidate.findUnique({
    where: { id },
    include: {
      applications: { include: { listing: true } },
      assessmentResults: { include: { assessment: true } },
      notes: { include: { user: { select: { name: true } } } },
      communications: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getCandidateByEmail(email: string) {
  return db.candidate.findUnique({ where: { email } });
}
