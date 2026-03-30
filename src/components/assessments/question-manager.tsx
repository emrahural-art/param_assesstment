"use client";

import { useState, useRef } from "react";
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
  category: string | null;
  imageUrl: string | null;
};

interface QuestionManagerProps {
  assessmentId: string;
  initialQuestions: Question[];
  categories?: string[];
}

export function QuestionManager({
  assessmentId,
  initialQuestions,
  categories = [],
}: QuestionManagerProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = useState(1);
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setText("");
    setOptions(["", "", "", "", ""]);
    setCorrectAnswer("");
    setPoints(1);
    setCategory("");
    setImageUrl("");
    setEditingQuestion(null);
    setError("");
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setText(q.text);
    setOptions(q.options && q.options.length > 0 ? q.options : ["", "", "", "", ""]);
    setCorrectAnswer(q.correctAnswer ?? "");
    setPoints(q.points);
    setCategory(q.category ?? "");
    setImageUrl(q.imageUrl ?? "");
    setEditingQuestion(q);
    setDialogOpen(true);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/question-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    setError("");

    const filteredOptions = options.filter((o) => o.trim() !== "");

    const body = {
      text,
      type: "MULTIPLE_CHOICE",
      options: filteredOptions,
      correctAnswer: correctAnswer || undefined,
      points,
      order: editingQuestion ? editingQuestion.order : questions.length,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
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
    } catch (err) {
      console.error("[QuestionManager]", err);
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

              <div className="space-y-2">
                <Label>Soru Görseli (Opsiyonel)</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "Yükleniyor..." : imageUrl ? "Görseli Değiştir" : "Görsel Yükle"}
                  </Button>
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setImageUrl("")}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                {imageUrl && (
                  <div className="mt-2 rounded-lg border bg-white p-2">
                    <img
                      src={imageUrl}
                      alt="Soru görseli"
                      className="max-h-40 rounded"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Puan</Label>
                  <Input
                    type="number"
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Seçenekler</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-muted text-xs font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Seçenek ${String.fromCharCode(65 + i)}`}
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
                {options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions([...options, ""])}
                  >
                    + Seçenek Ekle
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Doğru Cevap</Label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">Doğru cevabı seçin</option>
                  {options
                    .filter((o) => o.trim() !== "")
                    .map((opt, i) => (
                      <option key={i} value={opt}>
                        {String.fromCharCode(65 + i)}) {opt}
                      </option>
                    ))}
                </select>
              </div>

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
                      <p className="font-medium whitespace-pre-line">{q.text}</p>
                      {q.imageUrl && (
                        <img
                          src={q.imageUrl}
                          alt=""
                          className="mt-2 max-h-24 rounded border"
                        />
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {q.category && (
                          <Badge variant="outline" className="text-xs">
                            {q.category}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {q.points} puan
                        </span>
                        {!q.correctAnswer && (
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
                          opt === q.correctAnswer
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "bg-muted/50"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}) {opt}
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
