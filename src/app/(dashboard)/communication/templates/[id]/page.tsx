"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Template = {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/communication/templates/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!template) return;
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      type: form.get("type") as string,
      subject: form.get("subject") as string,
      body: form.get("body") as string,
    };

    try {
      const res = await fetch(
        `/api/communication/templates/${template.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        setMessage("Kaydedildi");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch {
      setMessage("Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!template || !confirm("Bu şablonu silmek istediğinize emin misiniz?"))
      return;

    await fetch(`/api/communication/templates/${template.id}`, {
      method: "DELETE",
    });
    router.push("/communication");
    router.refresh();
  }

  if (loading) return <p className="text-muted-foreground">Yükleniyor...</p>;
  if (!template) return <p className="text-muted-foreground">Şablon bulunamadı.</p>;

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
          <div className="flex items-center justify-between">
            <CardTitle>Şablonu Düzenle</CardTitle>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Sil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Şablon Adı</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={template.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select name="type" defaultValue={template.type}>
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
                defaultValue={template.subject}
                required
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
                defaultValue={template.body}
                required
                rows={10}
              />
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              {message && (
                <span className="text-sm text-muted-foreground">{message}</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
