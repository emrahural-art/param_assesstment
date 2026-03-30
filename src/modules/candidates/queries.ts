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

  if (filters?.company) {
    where.company = filters.company;
  }

  if (filters?.department) {
    where.department = { contains: filters.department, mode: "insensitive" };
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
      assessmentResults: {
        include: {
          assessment: {
            include: {
              questions: {
                select: { id: true, text: true, options: true, correctAnswer: true, category: true, points: true, order: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
      examInvites: {
        include: { assessment: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      },
      notes: { include: { user: { select: { name: true } } } },
      communications: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getCandidateByEmail(email: string) {
  return db.candidate.findUnique({ where: { email } });
}
