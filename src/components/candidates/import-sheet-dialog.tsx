"use client";

import { useState, useRef } from "react";
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
import {
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";

type PreviewData = {
  sheetTitle: string;
  headers: string[];
  mappings: Record<string, string | null>;
  preview: Record<string, string>[];
  totalRows: number;
};

type ImportResult = {
  imported: number;
  skipped: number;
  errors: { row: number; email?: string; message: string }[];
  totalProcessed: number;
};

const FIELD_LABELS: Record<string, string> = {
  firstName: "Ad",
  lastName: "Soyad",
  email: "E-posta",
  phone: "Telefon",
  company: "Şirket",
  position: "Pozisyon",
  department: "Departman",
  note: "Not",
};

export function ImportSheetDialog() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mappings, setMappings] = useState<Record<string, string | null>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  function resetState() {
    setStep(1);
    setError(null);
    setPreview(null);
    setMappings({});
    setResult(null);
    setCsvFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("preview", "true");

      const res = await fetch("/api/candidates/import/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Dosya okunamadı");
        setLoading(false);
        return;
      }

      setPreview(data as PreviewData);
      setMappings(data.mappings);
      setStep(2);
    } catch {
      setError("Dosya işlenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!csvFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("mappings", JSON.stringify(mappings));

      const res = await fetch("/api/candidates/import/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "İçe aktarma başarısız");
        setLoading(false);
        return;
      }

      setResult(data as ImportResult);
      setStep(3);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  function updateMapping(field: string, headerValue: string) {
    setMappings((prev) => ({
      ...prev,
      [field]: headerValue || null,
    }));
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          resetState();
          setOpen(true);
        }}
      >
        <FileSpreadsheet className="mr-1.5 h-4 w-4" />
        Toplu Yükle
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetState();
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CSV ile Toplu Aday Yükle</DialogTitle>
            <DialogDescription>
              {step === 1 && "Google Sheets'ten CSV olarak indirdiğiniz dosyayı yükleyin."}
              {step === 2 && `${preview?.sheetTitle} — ${preview?.totalRows} satır bulundu. Kolon eşlemelerini kontrol edin.`}
              {step === 3 && "İçe aktarma tamamlandı."}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={step >= 1 ? "font-medium text-foreground" : ""}>
              1. Dosya
            </span>
            <ArrowRight className="h-3 w-3" />
            <span className={step >= 2 ? "font-medium text-foreground" : ""}>
              2. Önizle
            </span>
            <ArrowRight className="h-3 w-3" />
            <span className={step >= 3 ? "font-medium text-foreground" : ""}>
              3. Sonuç
            </span>
          </div>

          {/* STEP 1: File Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div
                className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">
                  {csvFile ? csvFile.name : "CSV dosyasını sürükleyin veya tıklayın"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  .csv formatında dosya seçin
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Google Sheets'ten nasıl indirilir?</p>
                <p>1. Google Sheets'i açın</p>
                <p>2. <strong>Dosya → İndir → Virgülle ayrılmış değerler (.csv)</strong></p>
                <p>3. İndirilen .csv dosyasını buraya yükleyin</p>
              </div>

              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Beklenen sütunlar:</p>
                <p>Ad, Soyad, E-posta (zorunlu) + Telefon, Şirket, Pozisyon, Departman, Not (opsiyonel)</p>
                <p>İlk satır başlık satırı olmalıdır. Türkçe veya İngilizce başlıklar otomatik eşlenir.</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Dosya okunuyor...
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  İptal
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 2: Preview & Column Mapping */}
          {step === 2 && preview && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Kolon Eşlemeleri</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FIELD_LABELS).map(([field, label]) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="text-sm w-20 shrink-0">
                        {label}
                        {["firstName", "lastName", "email"].includes(field) && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </span>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={mappings[field] ?? ""}
                        onChange={(e) => updateMapping(field, e.target.value)}
                      >
                        <option value="">— Eşleme yok —</option>
                        {preview.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Önizleme (ilk {preview.preview.length} / {preview.totalRows} satır)
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {preview.headers.map((h) => (
                          <th key={h} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {preview.headers.map((h) => (
                            <td key={h} className="px-2 py-1.5 whitespace-nowrap">
                              {row[h] ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <DialogFooter>
                <Button variant="outline" onClick={() => { setStep(1); setCsvFile(null); }}>
                  Geri
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={
                    loading ||
                    !mappings.firstName ||
                    !mappings.lastName ||
                    !mappings.email
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      İçe aktarılıyor...
                    </>
                  ) : (
                    `${preview.totalRows} Adayı İçe Aktar`
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 3: Result */}
          {step === 3 && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                  <p className="text-xs text-muted-foreground">Başarılı</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-amber-500 mb-1" />
                  <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                  <p className="text-xs text-muted-foreground">Atlandı (mükerrer)</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-1" />
                  <p className="text-2xl font-bold text-red-600">
                    {result.errors.length - result.skipped}
                  </p>
                  <p className="text-xs text-muted-foreground">Hata</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Detaylar</p>
                  <div className="max-h-40 overflow-y-auto rounded-md border p-2 text-xs space-y-1">
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-muted-foreground">
                        <span className="font-medium">Satır {err.row}</span>
                        {err.email && <span> ({err.email})</span>}
                        : {err.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Kapat</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
