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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
};

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

    const body = {
      text,
      type,
      options: type === "OPEN_ENDED" ? [] : type === "TRUE_FALSE" ? ["Doğru", "Yanlış"] : filteredOptions,
      correctAnswer: correctAnswer || undefined,
      points,
      order: editingQuestion ? editingQuestion.order : questions.length,
    };

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
        if (!res.ok) throw new Error();

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
        if (!res.ok) throw new Error();

        const created = await res.json();
        setQuestions((prev) => [
          ...prev,
          { ...created, options: created.options as string[] | null },
        ]);
      }

      setDialogOpen(false);
      resetForm();
      router.refresh();
    } catch {
      setError("İşlem başarısız");
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button onClick={openCreate}>Soru Ekle</Button>
          </DialogTrigger>
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
                  <Select value={type} onValueChange={(v) => setType(v ?? "MULTIPLE_CHOICE")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Çoktan Seçmeli
                      </SelectItem>
                      <SelectItem value="MULTI_SELECT">
                        Çoklu Seçim
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">
                        Doğru/Yanlış
                      </SelectItem>
                      <SelectItem value="OPEN_ENDED">
                        Açık Uçlu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Puan</Label>
                  <Input
                    type="number"
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
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

              {type !== "OPEN_ENDED" && (
                <div className="space-y-2">
                  <Label>Doğru Cevap</Label>
                  {type === "TRUE_FALSE" ? (
                    <Select
                      value={correctAnswer}
                      onValueChange={(v) => setCorrectAnswer(v ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Doğru">Doğru</SelectItem>
                        <SelectItem value="Yanlış">Yanlış</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <span className="text-xs text-muted-foreground">
                          {q.points} puan
                        </span>
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
                          opt === q.correctAnswer
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "bg-muted/50"
                        }`}
                      >
                        {opt}
                        {opt === q.correctAnswer && " ✓"}
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
