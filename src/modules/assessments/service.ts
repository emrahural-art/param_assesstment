import { db } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { eventBus } from "@/lib/events";
import { type CreateAssessmentInput, type CreateQuestionInput, type ExamAnswer, type ExamViolation } from "./types";
import { calculateFullResult, type ScoringConfig } from "./scoring";

export async function createAssessment(input: CreateAssessmentInput & { scoringConfig?: ScoringConfig }) {
  const { scoringConfig, ...data } = input;
  return db.assessment.create({
    data: {
      ...data,
      scoringConfig: scoringConfig
        ? (scoringConfig as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export async function updateAssessment(
  id: string,
  input: Partial<CreateAssessmentInput> & { scoringConfig?: ScoringConfig },
) {
  const { scoringConfig, ...data } = input;
  return db.assessment.update({
    where: { id },
    data: {
      ...data,
      ...(scoringConfig !== undefined && {
        scoringConfig: scoringConfig as unknown as Prisma.InputJsonValue,
      }),
    },
  });
}

export async function deleteAssessment(id: string) {
  return db.assessment.delete({ where: { id } });
}

export async function addQuestion(input: CreateQuestionInput) {
  return db.question.create({
    data: {
      assessmentId: input.assessmentId,
      text: input.text,
      type: input.type,
      options: input.options ?? [],
      correctAnswer: input.correctAnswer,
      points: input.points ?? 1,
      order: input.order,
      category: input.category,
      tags: input.tags ?? [],
      imageUrl: input.imageUrl,
    },
  });
}

export async function updateQuestion(id: string, input: Partial<CreateQuestionInput>) {
  const { assessmentId, ...data } = input;
  return db.question.update({ where: { id }, data });
}

export async function deleteQuestion(id: string) {
  return db.question.delete({ where: { id } });
}

export async function startExam(candidateId: string, assessmentId: string) {
  return db.assessmentResult.create({
    data: { candidateId, assessmentId, startedAt: new Date() },
  });
}

export async function submitExam(
  candidateId: string,
  assessmentId: string,
  answers: ExamAnswer[],
  violations?: ExamViolation[],
) {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true },
  });

  if (!assessment) throw new Error("Assessment not found");

  const config = (assessment.scoringConfig as unknown as ScoringConfig) ?? {};
  const scorable = assessment.questions;

  const fullResult = calculateFullResult(scorable, answers, config);

  const result = await db.assessmentResult.update({
    where: { candidateId_assessmentId: { candidateId, assessmentId } },
    data: {
      score: fullResult.finalScore,
      totalPoints: fullResult.totalPossible,
      answers: JSON.parse(JSON.stringify(answers)) as Prisma.InputJsonValue,
      violations: violations
        ? (JSON.parse(JSON.stringify(violations)) as Prisma.InputJsonValue)
        : [],
      categoryScores: fullResult.categoryScores as unknown as Prisma.InputJsonValue,
      level: fullResult.level,
      jobFitResults: fullResult.jobFitResults as unknown as Prisma.InputJsonValue,
      dimensionResults: fullResult.dimensionResults as unknown as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
  });

  await eventBus.emit("assessment.completed", {
    candidateId,
    assessmentId,
    score: fullResult.finalScore,
  });

  return result;
}

export function shuffleQuestions<T>(questions: T[], seed: string): T[] {
  const shuffled = [...questions];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    const j = hash % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
