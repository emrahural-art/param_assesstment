"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";

type QuestionData = {
  id: string;
  text: string;
  options: string[] | null;
  correctAnswer: string | null;
  category: string | null;
  points: number;
  order: number;
};

type AnswerData = {
  questionId: string;
  answer: string;
};

interface AnswerKeySectionProps {
  questions: QuestionData[];
  answers: AnswerData[];
}

function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

function formatAnswer(answer: string, options: string[] | null): string {
  if (!options) return answer;
  const idx = options.indexOf(answer);
  if (idx >= 0) return `${optionLabel(idx)}) ${answer}`;
  return answer;
}

export function AnswerKeySection({ questions, answers }: AnswerKeySectionProps) {
  const [open, setOpen] = useState(false);

  if (questions.length === 0) return null;

  const answerMap = new Map<string, string>();
  for (const a of answers) {
    answerMap.set(a.questionId, a.answer);
  }

  const correctCount = questions.filter((q) => {
    const given = answerMap.get(q.id);
    return given != null && given === q.correctAnswer;
  }).length;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="text-xs text-muted-foreground px-0 hover:bg-transparent"
      >
        {open ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
        Cevap Anahtarı ({correctCount}/{questions.length} doğru)
      </Button>

      {open && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2 w-8">#</th>
                <th className="py-2 pr-2">Soru</th>
                <th className="py-2 pr-2 w-24">Kategori</th>
                <th className="py-2 pr-2 w-40">Adayın Cevabı</th>
                <th className="py-2 pr-2 w-40">Doğru Cevap</th>
                <th className="py-2 w-10 text-center">Sonuç</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => {
                const given = answerMap.get(q.id);
                const isCorrect = given != null && given === q.correctAnswer;
                const isUnanswered = given == null;

                return (
                  <tr key={q.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 pr-2 max-w-xs truncate" title={q.text}>
                      {q.text.length > 60 ? `${q.text.slice(0, 60)}...` : q.text}
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground text-xs">
                      {q.category ?? "-"}
                    </td>
                    <td className="py-1.5 pr-2">
                      {isUnanswered ? (
                        <span className="text-muted-foreground italic">Boş</span>
                      ) : (
                        <span className={isCorrect ? "text-green-700" : "text-red-600"}>
                          {formatAnswer(given, q.options as string[] | null)}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {q.correctAnswer
                        ? formatAnswer(q.correctAnswer, q.options as string[] | null)
                        : "-"}
                    </td>
                    <td className="py-1.5 text-center">
                      {isUnanswered ? (
                        <span className="text-muted-foreground">-</span>
                      ) : isCorrect ? (
                        <Check className="h-4 w-4 text-green-600 inline-block" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 inline-block" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
