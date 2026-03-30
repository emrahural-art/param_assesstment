"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMPANY_VALUES } from "@/modules/candidates/schema";
import { UserPlus } from "lucide-react";

const companyLabels: Record<string, string> = {
  PARAM: "Param",
  PARAMTECH: "ParamTech",
  FINROTA: "Finrota",
  KREDIM: "Kredim",
  UNIVERA: "Univera",
};

export function AddCandidateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    for (const [k, v] of fd.entries()) {
      const val = (v as string).trim();
      if (val) payload[k] = val;
    }

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (typeof data.error === "string") {
          setError(data.error);
        } else {
          const messages = Object.values(data.error).flat().join(", ");
          setError(messages);
        }
        setLoading(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Aday Ekle
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Aday Ekle</DialogTitle>
            <DialogDescription>
              Aday bilgilerini girerek sisteme kaydedin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  minLength={2}
                  placeholder="Adı"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  minLength={2}
                  placeholder="Soyadı"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ornek@firma.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  pattern="(\+90\s?)?0?5\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}"
                  title="Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)"
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Şirket</Label>
                <select
                  id="company"
                  name="company"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue=""
                >
                  <option value="">Seçiniz</option>
                  {COMPANY_VALUES.map((c) => (
                    <option key={c} value={c}>
                      {companyLabels[c] ?? c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="position">Pozisyon</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Yazılım Mühendisi"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Departman</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Yazılım Geliştirme"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Not</Label>
              <textarea
                id="note"
                name="note"
                rows={2}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Aday hakkında kısa not..."
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
