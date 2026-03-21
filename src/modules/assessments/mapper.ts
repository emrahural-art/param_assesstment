import { type Assessment, type Question } from "@/generated/prisma/client";
import { type AssessmentDTO, type QuestionDTO } from "./types";

type AssessmentWithQuestions = Assessment & { questions: Question[] };

export function toAssessmentDTO(assessment: AssessmentWithQuestions): AssessmentDTO {
  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    durationMinutes: assessment.durationMinutes,
    difficulty: assessment.difficulty,
    questionCount: assessment.questions.length,
    isActive: assessment.isActive,
  };
}

export function toQuestionDTO(question: Question): QuestionDTO {
  return {
    id: question.id,
    text: question.text,
    type: question.type,
    options: question.options as string[] | null,
    order: question.order,
    points: question.points,
  };
}
