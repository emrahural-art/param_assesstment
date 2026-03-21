import { type Assessment, type Question, type AssessmentResult, type Difficulty, type QuestionType } from "@/generated/prisma/client";

export type AssessmentDTO = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  difficulty: Difficulty;
  questionCount: number;
  isActive: boolean;
};

export type QuestionDTO = {
  id: string;
  text: string;
  type: QuestionType;
  options: string[] | null;
  order: number;
  points: number;
};

export type CreateAssessmentInput = {
  title: string;
  description?: string;
  durationMinutes: number;
  difficulty: Difficulty;
};

export type CreateQuestionInput = {
  assessmentId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  order: number;
};

export type ExamAnswer = {
  questionId: string;
  answer: string;
};

export type ExamViolation = {
  type: "tab_switch" | "fullscreen_exit" | "copy_attempt";
  timestamp: string;
};

export type { Assessment, Question, AssessmentResult };
