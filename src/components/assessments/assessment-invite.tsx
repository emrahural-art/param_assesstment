"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CandidateOption = {
  id: string;
  fullName: string;
  email: string;
};

type Invite = {
  id: string;
  token: string;
  status: string;
  sentAt: string | null;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

interface AssessmentInviteProps {
  assessmentId: string;
}

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  STARTED: "Başladı",
  COMPLETED: "Tamamlandı",
  EXPIRED: "Süresi Dolmuş",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  STARTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

export function AssessmentInvite({ assessmentId }: AssessmentInviteProps) {
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [candidatesRes, invitesRes] = await Promise.all([
      fetch("/api/candidates?limit=500"),
      fetch(`/api/assessments/${assessmentId}/invites`),
    ]);

    if (candidatesRes.ok) {
      const data = await candidatesRes.json();
      setCandidates(
        (data.candidates ?? data).map((c: Record<string, string>) => ({
          id: c.id,
          fullName: c.fullName ?? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
          email: c.email,
        })),
      );
    }

    if (invitesRes.ok) {
      setInvites(await invitesRes.json());
    }
  }, [assessmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const invitedIds = new Set(invites.map((inv) => inv.candidate.id));

  const filtered = candidates.filter((c) => {
    if (invitedIds.has(c.id)) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSendInvites() {
    if (selectedIds.size === 0) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/assessments/${assessmentId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateIds: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        await loadData();
      }
    } catch (err) {
      console.error("[AssessmentInvite]", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(inviteId: string) {
    setResendingId(inviteId);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/invites`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("[AssessmentInvite] resend failed", err);
    } finally {
      setResendingId(null);
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/exam/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aday Seç ve Davet Gönder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Aday ara (ad, soyad veya e-posta)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {filtered.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    className="rounded"
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
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {candidates.length === 0
                ? "Henüz aday yok"
                : "Davet edilmemiş aday bulunamadı"}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} aday seçildi
            </span>
            <Button
              onClick={handleSendInvites}
              disabled={loading || selectedIds.size === 0}
            >
              {loading ? "Gönderiliyor..." : "Davet Oluştur"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Gönderilen Davetler ({invites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {inv.candidate.firstName} {inv.candidate.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.candidate.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.sentAt ? (
                      <Badge
                        className="text-xs bg-emerald-100 text-emerald-800"
                        variant="outline"
                      >
                        E-posta Gönderildi
                      </Badge>
                    ) : (
                      <Badge
                        className="text-xs bg-orange-100 text-orange-800"
                        variant="outline"
                      >
                        E-posta Bekliyor
                      </Badge>
                    )}
                    <Badge
                      className={`text-xs ${statusColors[inv.status] ?? ""}`}
                      variant="outline"
                    >
                      {statusLabels[inv.status] ?? inv.status}
                    </Badge>
                    {inv.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(inv.id)}
                        disabled={resendingId === inv.id}
                      >
                        {resendingId === inv.id ? "Gönderiliyor..." : "Tekrar Gönder"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(inv.token)}
                    >
                      {copiedToken === inv.token ? "Kopyalandı!" : "Link Kopyala"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
