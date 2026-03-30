import type { Question } from "@/generated/prisma/client";
import type { ExamAnswer } from "./types";

export type ScoringConfig = {
  categories?: string[];
  categoryWeights?: Record<string, number>;
  penalties?: {
    categories: string[];
    penaltyPerWrong: number;
    label: string;
  }[];
  levels?: {
    name: string;
    minScore: number;
  }[];
  jobFitRules?: {
    role: string;
    conditions: {
      category: string;
      minScore: number;
    }[];
  }[];
  dimensions?: {
    name: string;
    rules: {
      label: string;
      minScore?: number;
      categories?: string[];
      minCategoryScore?: number;
      questionTags?: string[];
      minTaggedCorrect?: number;
    }[];
  }[];
};

export type CategoryScores = Record<string, number>;

export type JobFitResult = {
  role: string;
  result: "UYGUN" | "YETERSİZ";
};

export type DimensionResult = {
  name: string;
  label: string;
};

export type FullScoringResult = {
  rawScore: number;
  penaltyTotal: number;
  finalScore: number;
  totalPossible: number;
  categoryScores: CategoryScores;
  level: string | null;
  jobFitResults: JobFitResult[];
  dimensionResults: DimensionResult[];
};

type QuestionWithMeta = Pick<Question, "id" | "correctAnswer" | "points" | "category" | "tags">;

function isCorrect(question: QuestionWithMeta, answer: ExamAnswer | undefined): boolean {
  if (!question.correctAnswer || !answer) return false;
  return answer.answer.trim().toUpperCase() === question.correctAnswer.trim().toUpperCase();
}

export function calculateCategoryScores(
  questions: QuestionWithMeta[],
  answers: ExamAnswer[],
  config: ScoringConfig,
): { categoryScores: CategoryScores; rawScore: number; totalPossible: number; wrongPerCategory: Record<string, number> } {
  const categoryScores: CategoryScores = {};
  const wrongPerCategory: Record<string, number> = {};
  const weights = config.categoryWeights ?? {};
  let rawScore = 0;
  let totalPossible = 0;

  for (const q of questions) {
    const cat = q.category ?? "default";
    const weight = weights[cat] ?? q.points;
    totalPossible += weight;

    if (!categoryScores[cat]) categoryScores[cat] = 0;
    if (!wrongPerCategory[cat]) wrongPerCategory[cat] = 0;

    const answer = answers.find((a) => a.questionId === q.id);
    if (isCorrect(q, answer)) {
      categoryScores[cat] += weight;
      rawScore += weight;
    } else if (answer?.answer) {
      wrongPerCategory[cat]++;
    }
  }

  return { categoryScores, rawScore, totalPossible, wrongPerCategory };
}

export function applyPenalties(
  rawScore: number,
  wrongPerCategory: Record<string, number>,
  penalties?: ScoringConfig["penalties"],
): { penaltyTotal: number; finalScore: number } {
  if (!penalties?.length) return { penaltyTotal: 0, finalScore: rawScore };

  let penaltyTotal = 0;
  for (const rule of penalties) {
    for (const cat of rule.categories) {
      const wrongCount = wrongPerCategory[cat] ?? 0;
      penaltyTotal += wrongCount * Math.abs(rule.penaltyPerWrong);
    }
  }

  return { penaltyTotal, finalScore: Math.max(0, rawScore - penaltyTotal) };
}

export function determineLevel(
  finalScore: number,
  levels?: ScoringConfig["levels"],
): string | null {
  if (!levels?.length) return null;
  const sorted = [...levels].sort((a, b) => b.minScore - a.minScore);
  for (const level of sorted) {
    if (finalScore >= level.minScore) return level.name;
  }
  return sorted[sorted.length - 1]?.name ?? null;
}

export function evaluateJobFit(
  categoryScores: CategoryScores,
  jobFitRules?: ScoringConfig["jobFitRules"],
): JobFitResult[] {
  if (!jobFitRules?.length) return [];

  return jobFitRules.map((rule) => {
    const allMet = rule.conditions.every(
      (cond) => (categoryScores[cond.category] ?? 0) >= cond.minScore,
    );
    return { role: rule.role, result: allMet ? "UYGUN" : "YETERSİZ" };
  });
}

export function evaluateDimensions(
  categoryScores: CategoryScores,
  finalScore: number,
  questions: QuestionWithMeta[],
  answers: ExamAnswer[],
  dimensions?: ScoringConfig["dimensions"],
): DimensionResult[] {
  if (!dimensions?.length) return [];

  return dimensions.map((dim) => {
    const sortedRules = [...dim.rules];

    for (const rule of sortedRules) {
      let met = true;

      if (rule.minScore !== undefined) {
        met = finalScore >= rule.minScore;
      }

      if (met && rule.categories?.length && rule.minCategoryScore !== undefined) {
        met = rule.categories.every(
          (cat) => (categoryScores[cat] ?? 0) >= rule.minCategoryScore!,
        );
      }

      if (met && rule.questionTags?.length && rule.minTaggedCorrect !== undefined) {
        const taggedQuestions = questions.filter((q) =>
          q.tags?.some((t: string) => rule.questionTags!.includes(t)),
        );
        const correctCount = taggedQuestions.filter((q) => {
          const ans = answers.find((a) => a.questionId === q.id);
          return isCorrect(q, ans);
        }).length;
        met = correctCount >= rule.minTaggedCorrect;
      }

      if (met) {
        return { name: dim.name, label: rule.label };
      }
    }

    const fallback = sortedRules[sortedRules.length - 1];
    return { name: dim.name, label: fallback?.label ?? "Belirsiz" };
  });
}

export function calculateFullResult(
  questions: QuestionWithMeta[],
  answers: ExamAnswer[],
  config: ScoringConfig,
): FullScoringResult {
  const { categoryScores, rawScore, totalPossible, wrongPerCategory } =
    calculateCategoryScores(questions, answers, config);

  const { penaltyTotal, finalScore } = applyPenalties(
    rawScore,
    wrongPerCategory,
    config.penalties,
  );

  const level = determineLevel(finalScore, config.levels);
  const jobFitResults = evaluateJobFit(categoryScores, config.jobFitRules);
  const dimensionResults = evaluateDimensions(
    categoryScores,
    finalScore,
    questions,
    answers,
    config.dimensions,
  );

  return {
    rawScore,
    penaltyTotal,
    finalScore,
    totalPossible,
    categoryScores,
    level,
    jobFitResults,
    dimensionResults,
  };
}
