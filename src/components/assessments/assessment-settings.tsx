"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssessmentSettingsProps {
  assessment: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    difficulty: string;
    isActive: boolean;
  };
}

export function AssessmentSettings({ assessment }: AssessmentSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      durationMinutes: parseInt(form.get("durationMinutes") as string, 10),
      difficulty: form.get("difficulty") as string,
    };

    try {
      const res = await fetch(`/api/assessments/${assessment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("Kaydedildi");
        router.refresh();
      }
    } catch {
      setMessage("Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive() {
    try {
      await fetch(`/api/assessments/${assessment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !assessment.isActive }),
      });
      router.refresh();
    } catch {
      // silently fail
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Bu testi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      )
    )
      return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/assessments/${assessment.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/assessments");
      }
    } catch {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Adı</Label>
              <Input
                id="title"
                name="title"
                defaultValue={assessment.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={assessment.description}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Süre (dakika)</Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min={1}
                  max={300}
                  defaultValue={assessment.durationMinutes}
                />
              </div>

              <div className="space-y-2">
                <Label>Zorluk</Label>
                <Select name="difficulty" defaultValue={assessment.difficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Kolay</SelectItem>
                    <SelectItem value="MEDIUM">Orta</SelectItem>
                    <SelectItem value="HARD">Zor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              {message && (
                <span className="text-sm text-muted-foreground">{message}</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Durum</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Test şu an{" "}
            <strong>
              {assessment.isActive ? "aktif" : "pasif"}
            </strong>
            .{" "}
            {assessment.isActive
              ? "Adaylara gönderilebilir."
              : "Adaylara gönderilmez."}
          </p>
          <Button variant="outline" onClick={toggleActive}>
            {assessment.isActive ? "Pasife Al" : "Aktifleştir"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Tehlikeli Alan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Bu testi kalıcı olarak siler. Tüm sorular ve sonuçlar da silinir.
          </p>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Siliniyor..." : "Testi Sil"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
