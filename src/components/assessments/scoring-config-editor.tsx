"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ScoringConfig } from "@/modules/assessments/scoring";

interface ScoringConfigEditorProps {
  assessmentId: string;
  initialConfig: ScoringConfig;
}

export function ScoringConfigEditor({
  assessmentId,
  initialConfig,
}: ScoringConfigEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"visual" | "json">(
    Object.keys(initialConfig).length > 0 ? "visual" : "visual",
  );

  const [categories, setCategories] = useState<string>(
    (initialConfig.categories ?? []).join(", "),
  );
  const [categoryWeights, setCategoryWeights] = useState<Record<string, number>>(
    initialConfig.categoryWeights ?? {},
  );
  const [levels, setLevels] = useState(
    initialConfig.levels ?? [],
  );
  const [jsonRaw, setJsonRaw] = useState(
    JSON.stringify(initialConfig, null, 2),
  );

  const parsedCategories = categories
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  async function handleSave() {
    setLoading(true);
    setMessage("");

    let config: ScoringConfig;

    if (mode === "json") {
      try {
        config = JSON.parse(jsonRaw);
      } catch {
        setMessage("Geçersiz JSON formatı");
        setLoading(false);
        return;
      }
    } else {
      config = {
        categories: parsedCategories.length > 0 ? parsedCategories : undefined,
        categoryWeights:
          Object.keys(categoryWeights).length > 0 ? categoryWeights : undefined,
        levels: levels.length > 0 ? levels : undefined,
        penalties: initialConfig.penalties,
        jobFitRules: initialConfig.jobFitRules,
        dimensions: initialConfig.dimensions,
      };
    }

    try {
      const res = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoringConfig: config }),
      });

      if (res.ok) {
        setMessage("Puanlama yapılandırması kaydedildi");
        router.refresh();
      } else {
        setMessage("Kaydetme hatası");
      }
    } catch {
      setMessage("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex gap-2">
        <Button
          variant={mode === "visual" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("visual")}
        >
          Görsel Editör
        </Button>
        <Button
          variant={mode === "json" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const config: ScoringConfig = {
              categories: parsedCategories.length > 0 ? parsedCategories : undefined,
              categoryWeights:
                Object.keys(categoryWeights).length > 0 ? categoryWeights : undefined,
              levels: levels.length > 0 ? levels : undefined,
              penalties: initialConfig.penalties,
              jobFitRules: initialConfig.jobFitRules,
              dimensions: initialConfig.dimensions,
            };
            setJsonRaw(JSON.stringify(config, null, 2));
            setMode("json");
          }}
        >
          JSON Editör
        </Button>
      </div>

      {mode === "visual" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategoriler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori İsimleri (virgülle ayırın)</Label>
                <Input
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="Örn: Sözel, Sayısal, Mantık"
                />
              </div>
              {parsedCategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Kategori Ağırlıkları (puan/doğru)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {parsedCategories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-sm min-w-[80px]">{cat}:</span>
                        <Input
                          type="number"
                          min={1}
                          value={categoryWeights[cat] ?? 1}
                          onChange={(e) =>
                            setCategoryWeights((prev) => ({
                              ...prev,
                              [cat]: parseInt(e.target.value, 10) || 1,
                            }))
                          }
                          className="w-20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seviye Eşikleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {levels.map((level, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={level.name}
                    onChange={(e) => {
                      const newLevels = [...levels];
                      newLevels[i] = { ...newLevels[i], name: e.target.value };
                      setLevels(newLevels);
                    }}
                    placeholder="Seviye adı"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={level.minScore}
                    onChange={(e) => {
                      const newLevels = [...levels];
                      newLevels[i] = {
                        ...newLevels[i],
                        minScore: parseInt(e.target.value, 10) || 0,
                      };
                      setLevels(newLevels);
                    }}
                    placeholder="Min puan"
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLevels(levels.filter((_, j) => j !== i))}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLevels([...levels, { name: "", minScore: 0 }])}
              >
                + Seviye Ekle
              </Button>
            </CardContent>
          </Card>

          {(initialConfig.penalties?.length ||
            initialConfig.jobFitRules?.length ||
            initialConfig.dimensions?.length) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Gelişmiş Kurallar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Ceza kuralları, uygunluk değerlendirmesi ve boyut kuralları JSON
                  editöründen düzenlenebilir.
                </p>
                {initialConfig.penalties && (
                  <div className="text-sm">
                    <strong>Ceza Kuralları:</strong>{" "}
                    {initialConfig.penalties.length} adet
                  </div>
                )}
                {initialConfig.jobFitRules && (
                  <div className="text-sm">
                    <strong>Uygunluk Kuralları:</strong>{" "}
                    {initialConfig.jobFitRules.length} adet
                  </div>
                )}
                {initialConfig.dimensions && (
                  <div className="text-sm">
                    <strong>Boyutlar:</strong>{" "}
                    {initialConfig.dimensions.length} adet
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JSON Yapılandırma</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jsonRaw}
              onChange={(e) => setJsonRaw(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Puanlama Yapılandırmasını Kaydet"}
        </Button>
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    </div>
  );
}
