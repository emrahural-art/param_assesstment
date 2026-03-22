"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  correctAnswer: string | null;
  points: number;
  order: number;
};

const typeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Çoktan Seçmeli",
  MULTI_SELECT: "Çoklu Seçim",
  TRUE_FALSE: "Doğru/Yanlış",
  OPEN_ENDED: "Açık Uçlu",
  PERSONALITY_SCALE: "Kişilik Ölçeği",
};

const LIKERT_OPTIONS = [
  "Kesinlikle Katılmıyorum",
  "Katılmıyorum",
  "Kararsızım",
  "Katılıyorum",
  "Kesinlikle Katılıyorum",
];

interface QuestionManagerProps {
  assessmentId: string;
  initialQuestions: Question[];
}

export function QuestionManager({
  assessmentId,
  initialQuestions,
}: QuestionManagerProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [text, setText] = useState("");
  const [type, setType] = useState("MULTIPLE_CHOICE");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = useState(1);

  function resetForm() {
    setText("");
    setType("MULTIPLE_CHOICE");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setPoints(1);
    setEditingQuestion(null);
    setError("");
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setText(q.text);
    setType(q.type);
    setOptions(q.options ?? ["", "", "", ""]);
    setCorrectAnswer(q.correctAnswer ?? "");
    setPoints(q.points);
    setEditingQuestion(q);
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError("");

    const filteredOptions = options.filter((o) => o.trim() !== "");

    const resolvedOptions =
      type === "OPEN_ENDED"
        ? []
        : type === "TRUE_FALSE"
          ? ["Doğru", "Yanlış"]
          : type === "PERSONALITY_SCALE"
            ? LIKERT_OPTIONS
            : filteredOptions;

    const body = {
      text,
      type,
      options: resolvedOptions,
      correctAnswer: type === "OPEN_ENDED" || type === "PERSONALITY_SCALE" ? undefined : correctAnswer || undefined,
      points: type === "PERSONALITY_SCALE" ? 0 : points,
      order: editingQuestion ? editingQuestion.order : questions.length,
    };

    console.log("[QuestionManager] Saving:", { assessmentId, body });

    try {
      if (editingQuestion) {
        const res = await fetch(
          `/api/assessments/${assessmentId}/questions/${editingQuestion.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.error
              ? typeof errData.error === "string"
                ? errData.error
                : JSON.stringify(errData.error)
              : `HTTP ${res.status}`
          );
        }

        const updated = await res.json();
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestion.id
              ? { ...updated, options: updated.options as string[] | null }
              : q
          )
        );
      } else {
        const res = await fetch(
          `/api/assessments/${assessmentId}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.error
              ? typeof errData.error === "string"
                ? errData.error
                : JSON.stringify(errData.error)
              : `HTTP ${res.status}`
          );
        }

        const created = await res.json();
        setQuestions((prev) => [
          ...prev,
          { ...created, options: created.options as string[] | null },
        ]);
      }

      setDialogOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(questionId: string) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(
        `/api/assessments/${assessmentId}/questions/${questionId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      router.refresh();
    } catch {
      // silently fail
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Sorular ({questions.length})
        </h3>
        <Button onClick={openCreate}>Soru Ekle</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Soruyu Düzenle" : "Yeni Soru Ekle"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Soru Metni</Label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  placeholder="Soruyu yazın..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Soru Tipi</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                  >
                    <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
                    <option value="MULTI_SELECT">Çoklu Seçim</option>
                    <option value="TRUE_FALSE">Doğru/Yanlış</option>
                    <option value="OPEN_ENDED">Açık Uçlu</option>
                    <option value="PERSONALITY_SCALE">Kişilik Ölçeği (Likert)</option>
                  </select>
                </div>

                {type !== "PERSONALITY_SCALE" && (
                  <div className="space-y-2">
                    <Label>Puan</Label>
                    <Input
                      type="number"
                      min={type === "OPEN_ENDED" ? 0 : 1}
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                )}
              </div>

              {(type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") && (
                <div className="space-y-2">
                  <Label>Seçenekler</Label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }}
                        placeholder={`Seçenek ${i + 1}`}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setOptions(options.filter((_, j) => j !== i))
                          }
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions([...options, ""])}
                  >
                    + Seçenek Ekle
                  </Button>
                </div>
              )}

              {type === "PERSONALITY_SCALE" && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium mb-2">Likert Ölçeği (5'li)</p>
                  <div className="flex gap-2 flex-wrap">
                    {LIKERT_OPTIONS.map((opt) => (
                      <span
                        key={opt}
                        className="inline-flex items-center rounded-md border bg-background px-2.5 py-1 text-xs"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Doğru/yanlış cevap yoktur, adayın yanıtı profil olarak kaydedilir.
                  </p>
                </div>
              )}

              {type !== "OPEN_ENDED" && type !== "PERSONALITY_SCALE" && (
                <div className="space-y-2">
                  <Label>Doğru Cevap</Label>
                  {type === "TRUE_FALSE" ? (
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                    >
                      <option value="">Seçin</option>
                      <option value="Doğru">Doğru</option>
                      <option value="Yanlış">Yanlış</option>
                    </select>
                  ) : (
                    <Input
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="Doğru cevabı girin (seçenek metni ile aynı)"
                    />
                  )}
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleSave}
                disabled={loading || text.length < 5}
                className="w-full"
              >
                {loading
                  ? "Kaydediliyor..."
                  : editingQuestion
                    ? "Güncelle"
                    : "Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Henüz soru eklenmemiş. Yukarıdaki &quot;Soru Ekle&quot; butonunu
            kullanın.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeLabels[q.type] ?? q.type}
                        </Badge>
                        {q.type !== "PERSONALITY_SCALE" && (
                          <span className="text-xs text-muted-foreground">
                            {q.points} puan
                          </span>
                        )}
                        {!q.correctAnswer && q.type !== "PERSONALITY_SCALE" && q.type !== "OPEN_ENDED" && (
                          <span className="text-xs text-amber-600">
                            Doğru cevap belirtilmemiş
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(q)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(q.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {q.options && q.options.length > 0 && (
                <CardContent className="pt-0 pb-3">
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs ${
                          q.type === "PERSONALITY_SCALE"
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : opt === q.correctAnswer
                              ? "border-green-300 bg-green-50 text-green-800"
                              : "bg-muted/50"
                        }`}
                      >
                        {q.type === "PERSONALITY_SCALE" && `${i + 1}. `}
                        {opt}
                        {q.type !== "PERSONALITY_SCALE" && opt === q.correctAnswer && " ✓"}
                      </span>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
