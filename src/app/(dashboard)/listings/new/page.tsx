"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          requirements: formData.get("requirements"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "İlan oluşturulamadı");
      }

      router.push("/listings");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/listings"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; İlanlara Dön
        </Link>
        <h2 className="mt-2 text-2xl font-bold">Yeni İlan Oluştur</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İlan Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">İlan Başlığı *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Frontend Developer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Pozisyon Açıklaması</Label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                placeholder="Pozisyonun detaylı açıklamasını yazın..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Aranan Nitelikler</Label>
              <Textarea
                id="requirements"
                name="requirements"
                rows={6}
                placeholder="Aranan nitelikleri ve yetkinlikleri yazın..."
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Oluşturuluyor..." : "İlan Oluştur"}
              </Button>
              <Link href="/listings">
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
