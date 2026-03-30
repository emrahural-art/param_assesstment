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
import { Pencil } from "lucide-react";

const companyLabels: Record<string, string> = {
  PARAM: "Param",
  PARAMTECH: "ParamTech",
  FINROTA: "Finrota",
  KREDIM: "Kredim",
  UNIVERA: "Univera",
};

type EditCandidateProps = {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    company: string | null;
    position: string | null;
    department: string | null;
  };
};

export function EditCandidateDialog({ candidate }: EditCandidateProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string | null> = {};
    for (const [k, v] of fd.entries()) {
      const val = (v as string).trim();
      payload[k] = val || null;
    }

    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Güncelleme başarısız");
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-1.5 h-3.5 w-3.5" />
        Düzenle
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aday Bilgilerini Düzenle</DialogTitle>
            <DialogDescription>
              Aday bilgilerini güncelleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName">Ad *</Label>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  required
                  minLength={2}
                  defaultValue={candidate.firstName}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lastName">Soyad *</Label>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  required
                  minLength={2}
                  defaultValue={candidate.lastName}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email">E-posta *</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                required
                defaultValue={candidate.email}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  pattern="(\+90\s?)?0?5\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}"
                  title="Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)"
                  defaultValue={candidate.phone ?? ""}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-company">Şirket</Label>
                <select
                  id="edit-company"
                  name="company"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={candidate.company ?? ""}
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
                <Label htmlFor="edit-position">Pozisyon</Label>
                <Input
                  id="edit-position"
                  name="position"
                  defaultValue={candidate.position ?? ""}
                  placeholder="Yazılım Mühendisi"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-department">Departman</Label>
                <Input
                  id="edit-department"
                  name="department"
                  defaultValue={candidate.department ?? ""}
                  placeholder="Yazılım Geliştirme"
                />
              </div>
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
                {loading ? "Kaydediliyor..." : "Güncelle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
