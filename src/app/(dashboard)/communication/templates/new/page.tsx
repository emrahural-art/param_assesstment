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

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      type: form.get("type") as string,
      subject: form.get("subject") as string,
      body: form.get("body") as string,
    };

    try {
      const res = await fetch("/api/communication/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setError("Şablon oluşturulamadı");
        return;
      }

      router.push("/communication");
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/communication"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; İletişim Merkezi
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Yeni E-posta Şablonu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Şablon Adı</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Örn: Olumlu Dönüş"
                />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select name="type" defaultValue="CUSTOM">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">Olumlu Dönüş</SelectItem>
                    <SelectItem value="NEGATIVE">Olumsuz Dönüş</SelectItem>
                    <SelectItem value="INVITATION">Davet</SelectItem>
                    <SelectItem value="TEST_INVITE">Test Daveti</SelectItem>
                    <SelectItem value="CUSTOM">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">E-posta Konusu</Label>
              <Input
                id="subject"
                name="subject"
                required
                placeholder="Başvurunuz hakkında"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">İçerik</Label>
              <p className="text-xs text-muted-foreground">
                Değişkenler: {"{{fullName}}"}, {"{{position}}"}, {"{{company}}"}
              </p>
              <Textarea
                id="body"
                name="body"
                required
                rows={10}
                placeholder={"Sayın {{fullName}},\n\nBaşvurunuz değerlendirilmiştir..."}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Oluşturuluyor..." : "Şablonu Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
