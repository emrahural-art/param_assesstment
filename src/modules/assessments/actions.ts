"use server";

import { revalidatePath } from "next/cache";
import { createAssessmentSchema, createQuestionSchema, submitExamSchema } from "./schema";
import {
  createAssessment as createAssessmentService,
  addQuestion as addQuestionService,
  submitExam as submitExamService,
} from "./service";
import { logger } from "@/lib/logger";

export async function createAssessmentAction(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    durationMinutes: formData.get("durationMinutes") as string,
    difficulty: formData.get("difficulty") as string,
  };

  const parsed = createAssessmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const assessment = await createAssessmentService(parsed.data);
    revalidatePath("/assessments");
    return { success: true, id: assessment.id };
  } catch (err) {
    logger.error("Failed to create assessment", "assessments.actions", { error: String(err) });
    return { error: "Test oluşturulurken bir hata oluştu" };
  }
}

export async function addQuestionAction(formData: FormData) {
  const raw = {
    assessmentId: formData.get("assessmentId") as string,
    text: formData.get("text") as string,
    type: formData.get("type") as string,
    options: JSON.parse((formData.get("options") as string) || "[]"),
    correctAnswer: formData.get("correctAnswer") as string,
    points: formData.get("points") as string,
    order: formData.get("order") as string,
  };

  const parsed = createQuestionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await addQuestionService(parsed.data);
    revalidatePath("/assessments");
    return { success: true };
  } catch (err) {
    logger.error("Failed to add question", "assessments.actions", { error: String(err) });
    return { error: "Soru eklenirken bir hata oluştu" };
  }
}

export async function submitExamAction(data: {
  assessmentId: string;
  candidateId: string;
  answers: { questionId: string; answer: string }[];
  violations?: { type: "tab_switch" | "fullscreen_exit" | "copy_attempt"; timestamp: string }[];
}) {
  const parsed = submitExamSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await submitExamService(
      data.candidateId,
      parsed.data.assessmentId,
      parsed.data.answers,
      parsed.data.violations
    );
    return { success: true, score: result.score, totalPoints: result.totalPoints };
  } catch (err) {
    logger.error("Failed to submit exam", "assessments.actions", { error: String(err) });
    return { error: "Sınav gönderilirken bir hata oluştu" };
  }
}
