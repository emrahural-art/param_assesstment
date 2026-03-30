"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleLabels: Record<string, string> = {
  ADMIN: "Yönetici",
  HR_MANAGER: "İK Müdürü",
  HR_SPECIALIST: "İK Uzmanı",
  HR_INTERN: "İK Stajyeri",
};

type InviteRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  invitedBy: { id: string; name: string; email: string };
};

function formatApiError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "İşlem başarısız";
  const err = payload as { error?: unknown };
  if (typeof err.error === "string") return err.error;
  if (err.error && typeof err.error === "object") {
    return Object.values(err.error as Record<string, unknown>)
      .flat()
      .filter((v) => typeof v === "string")
      .join(", ");
  }
  return "İşlem başarısız";
}

export default function InviteAdminClient({ currentRole }: { currentRole?: string }) {
  const canInviteAdmin = currentRole === "SYSTEM_ADMIN";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [role, setRole] = useState("HR_SPECIALIST");

  const loadInvites = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/invites");
      if (res.ok) {
        const data = (await res.json()) as InviteRow[];
        setInvites(data);
      }
    } catch (err) {
      console.error("[InviteAdmin]", err);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(formatApiError(body));
        return;
      }

      (e.target as HTMLFormElement).reset();
      await loadInvites();
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function removeInvite(id: string) {
    if (!confirm("Bu daveti iptal etmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/invites/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error("[InviteAdmin]", err);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/settings"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Ayarlar
      </Link>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Kullanıcı davet et</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Davet ettiğiniz e-posta adresi Google hesabıyla ilk girişte otomatik
            olarak kullanıcı oluşturulur. Şifre gerekmez.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={role}
                onValueChange={(v) => v && setRole(v)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canInviteAdmin && (
                    <SelectItem value="ADMIN">Yönetici</SelectItem>
                  )}
                  <SelectItem value="HR_MANAGER">İK Müdürü</SelectItem>
                  <SelectItem value="HR_SPECIALIST">İK Uzmanı</SelectItem>
                  <SelectItem value="HR_INTERN">İK Stajyeri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Kaydediliyor..." : "Davet ekle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Bekleyen davetler</CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          ) : invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bekleyen davet yok.</p>
          ) : (
            <div className="rounded-lg border divide-y">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3"
                >
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[inv.role] ?? inv.role} ·{" "}
                      {new Date(inv.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInvite(inv.id)}
                  >
                    İptal
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
