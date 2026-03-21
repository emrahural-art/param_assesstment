"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";

type Template = {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
};

type Candidate = {
  id: string;
  fullName: string;
  email: string;
};

export default function SendEmailPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/communication/templates")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/candidates")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCandidates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function applyTemplate(templateId: string | null) {
    if (!templateId) return;
    const t = templates.find((t) => t.id === templateId);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  }

  function toggleCandidate(id: string) {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function selectAll() {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((c) => c.id));
    }
  }

  async function handleSend() {
    if (selectedCandidates.length === 0 || !subject || !body) return;
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          subject,
          body,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      setResult({ sent: 0, failed: selectedCandidates.length });
    } finally {
      setSending(false);
    }
  }

  const filteredCandidates = candidates.filter(
    (c) =>
      searchTerm === "" ||
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Link
        href="/communication"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; İletişim Merkezi
      </Link>

      <h2 className="text-2xl font-bold">E-posta Gönder</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Content */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İçerik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Şablon Kullan</Label>
                  <Select onValueChange={applyTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şablon seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E-posta konusu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">İçerik</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  placeholder="E-posta içeriği..."
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSend}
            disabled={
              sending ||
              selectedCandidates.length === 0 ||
              !subject ||
              !body
            }
            className="w-full"
            size="lg"
          >
            {sending
              ? "Gönderiliyor..."
              : `${selectedCandidates.length} Adaya Gönder`}
          </Button>

          {result && (
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-sm">
                  <span className="font-bold text-green-600">
                    {result.sent} başarılı
                  </span>
                  {result.failed > 0 && (
                    <>
                      {" / "}
                      <span className="font-bold text-destructive">
                        {result.failed} başarısız
                      </span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Candidates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Alıcılar ({selectedCandidates.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={selectAll}>
                {selectedCandidates.length === filteredCandidates.length
                  ? "Seçimi Kaldır"
                  : "Tümünü Seç"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Aday ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aday bulunamadı
                </p>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedCandidates.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCandidate(c.id)}
                        className="accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {c.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.email}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
