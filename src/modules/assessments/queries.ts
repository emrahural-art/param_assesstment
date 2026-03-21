import { db } from "@/lib/prisma";

export async function getAssessments() {
  return db.assessment.findMany({
    include: { questions: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAssessmentById(id: string) {
  return db.assessment.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
}

export async function getAssessmentForExam(id: string) {
  return db.assessment.findUnique({
    where: { id, isActive: true },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          type: true,
          options: true,
          order: true,
          points: true,
        },
      },
    },
  });
}

export async function getAssessmentResult(candidateId: string, assessmentId: string) {
  return db.assessmentResult.findUnique({
    where: { candidateId_assessmentId: { candidateId, assessmentId } },
    include: { assessment: true },
  });
}

export async function getResultsByCandidateId(candidateId: string) {
  return db.assessmentResult.findMany({
    where: { candidateId },
    include: { assessment: true },
    orderBy: { startedAt: "desc" },
  });
}
