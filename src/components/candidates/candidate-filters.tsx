"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const stages = [
  { value: "NEW_APPLICATION", label: "Yeni Başvuru" },
  { value: "SCREENING", label: "Ön Eleme" },
  { value: "INTERVIEW", label: "Mülakat" },
  { value: "ASSESSMENT", label: "Değerlendirme Testi" },
  { value: "OFFER", label: "Teklif" },
  { value: "HIRED", label: "İşe Alındı" },
  { value: "REJECTED", label: "Reddedildi" },
];

export function CandidateFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/candidates?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/candidates");
  }

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("stage") ||
    searchParams.has("status") ||
    searchParams.has("company") ||
    searchParams.has("department");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="İsim veya e-posta ara..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length === 0 || value.length >= 2) {
            updateFilter("search", value || null);
          }
        }}
        className="w-64"
      />

      <Select
        value={searchParams.get("stage") ?? ""}
        onValueChange={(value) => updateFilter("stage", value || null)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Aşama seçin" />
        </SelectTrigger>
        <SelectContent>
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <select
        value={searchParams.get("company") ?? ""}
        onChange={(e) => updateFilter("company", e.target.value || null)}
        className="flex h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
      >
        <option value="">Tüm Şirketler</option>
        <option value="PARAM">Param</option>
        <option value="PARAMTECH">ParamTech</option>
        <option value="FINROTA">Finrota</option>
        <option value="KREDIM">Kredim</option>
        <option value="UNIVERA">Univera</option>
      </select>

      <Input
        placeholder="Departman ara..."
        defaultValue={searchParams.get("department") ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length === 0 || value.length >= 2) {
            updateFilter("department", value || null);
          }
        }}
        className="w-44"
      />

      <Select
        value={searchParams.get("status") ?? ""}
        onValueChange={(value) => updateFilter("status", value || null)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVE">Aktif</SelectItem>
          <SelectItem value="ARCHIVED">Arşiv</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Temizle
        </Button>
      )}
    </div>
  );
}
