"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddNoteFormProps {
  candidateId: string;
}

export function AddNoteForm({ candidateId }: AddNoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          rating: rating ? parseInt(rating, 10) : undefined,
          userId: "system",
        }),
      });

      if (res.ok) {
        setContent("");
        setRating("");
        setMessage("Not eklendi");
        router.refresh();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("Hata oluştu");
      }
    } catch {
      setMessage("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Not Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="noteContent">Not</Label>
            <Textarea
              id="noteContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mülakat notlarınızı buraya yazın..."
              rows={3}
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="noteRating">Puan (1-10, opsiyonel)</Label>
              <Input
                id="noteRating"
                type="number"
                min={1}
                max={10}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Ör: 8"
                className="w-28"
              />
            </div>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
