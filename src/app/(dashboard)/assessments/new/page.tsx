"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function NewAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      durationMinutes: parseInt(form.get("durationMinutes") as string, 10),
      difficulty: form.get("difficulty") as string,
    };

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(typeof err.error === "string" ? err.error : "Bir hata oluştu");
        return;
      }

      const assessment = await res.json();
      router.push(`/assessments/${assessment.id}`);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/assessments"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Testler
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Yeni Test Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Adı</Label>
              <Input
                id="title"
                name="title"
                required
                minLength={3}
                placeholder="Örn: JavaScript Temel Bilgi Testi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Test hakkında kısa açıklama..."
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
                  required
                  min={1}
                  max={300}
                  defaultValue={30}
                />
              </div>

              <div className="space-y-2">
                <Label>Zorluk</Label>
                <Select name="difficulty" defaultValue="MEDIUM">
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
