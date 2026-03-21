import { z } from "zod";

export const createAssessmentSchema = z.object({
  title: z.string().min(3, "Test adı en az 3 karakter olmalıdır"),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(1).max(300),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

export const createQuestionSchema = z.object({
  assessmentId: z.string(),
  text: z.string().min(5, "Soru metni en az 5 karakter olmalıdır"),
  type: z.enum(["MULTIPLE_CHOICE", "MULTI_SELECT", "TRUE_FALSE", "OPEN_ENDED"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  points: z.coerce.number().min(1).default(1),
  order: z.coerce.number().min(0),
});

export const submitExamSchema = z.object({
  assessmentId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
  violations: z
    .array(
      z.object({
        type: z.enum(["tab_switch", "fullscreen_exit", "copy_attempt"]),
        timestamp: z.string(),
      })
    )
    .optional(),
});
