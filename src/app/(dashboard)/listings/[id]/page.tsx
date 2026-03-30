"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  status: string;
  applications: {
    id: string;
    stage: string;
    appliedAt: string;
    candidate: { firstName: string; lastName: string; email: string };
  }[];
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    if (!listing) return;

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setListing({ ...listing, status: newStatus });
      }
    } catch (err) {
      console.error("[ListingDetail]", err);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!listing) return;
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          requirements: formData.get("requirements"),
        }),
      });

      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!listing || !confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;

    await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    router.push("/listings");
    router.refresh();
  }

  if (loading) {
    return <p className="text-muted-foreground">Yükleniyor...</p>;
  }

  if (!listing) {
    return <p className="text-muted-foreground">İlan bulunamadı.</p>;
  }

  const statusLabels: Record<string, string> = {
    DRAFT: "Taslak",
    PUBLISHED: "Yayında",
    CLOSED: "Kapalı",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/listings"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; İlanlara Dön
        </Link>
        <div className="flex items-center gap-3">
          <Select
            value={listing.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Taslak</SelectItem>
              <SelectItem value="PUBLISHED">Yayında</SelectItem>
              <SelectItem value="CLOSED">Kapalı</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Sil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İlan Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">İlan Başlığı</Label>
              <Input
                id="title"
                name="title"
                defaultValue={listing.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Pozisyon Açıklaması</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={listing.description ?? ""}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Aranan Nitelikler</Label>
              <Textarea
                id="requirements"
                name="requirements"
                defaultValue={listing.requirements ?? ""}
                rows={6}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Başvurular ({listing.applications.length})
            </CardTitle>
            {listing.applications.length > 0 && (
              <Link href={`/listings/${listing.id}/shortlist`}>
                <Button variant="outline" size="sm">
                  Karşılaştır / Shortlist
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {listing.applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz başvuru yok.
            </p>
          ) : (
            <div className="space-y-3">
              {listing.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {app.candidate.firstName} {app.candidate.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {app.candidate.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {statusLabels[app.stage] ?? app.stage}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
