import { db } from "@/lib/prisma";
import { eventBus } from "@/lib/events";
import { type CreateAssessmentInput, type CreateQuestionInput, type ExamAnswer, type ExamViolation } from "./types";

export async function createAssessment(input: CreateAssessmentInput) {
  return db.assessment.create({ data: input });
}

export async function updateAssessment(id: string, input: Partial<CreateAssessmentInput>) {
  return db.assessment.update({ where: { id }, data: input });
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
  violations?: ExamViolation[]
) {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true },
  });

  if (!assessment) throw new Error("Assessment not found");

  let score = 0;
  let totalPoints = 0;

  const unscoredTypes = ["OPEN_ENDED", "PERSONALITY_SCALE"];

  for (const question of assessment.questions) {
    if (unscoredTypes.includes(question.type)) continue;
    if (!question.correctAnswer) continue;

    totalPoints += question.points;
    const answer = answers.find((a) => a.questionId === question.id);
    if (answer && answer.answer === question.correctAnswer) {
      score += question.points;
    }
  }

  const result = await db.assessmentResult.update({
    where: { candidateId_assessmentId: { candidateId, assessmentId } },
    data: {
      score,
      totalPoints,
      answers: JSON.parse(JSON.stringify(answers)),
      violations: violations ? JSON.parse(JSON.stringify(violations)) : [],
      completedAt: new Date(),
    },
  });

  await eventBus.emit("assessment.completed", { candidateId, assessmentId, score });

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
