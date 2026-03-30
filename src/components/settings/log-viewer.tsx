"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, ChevronDown } from "lucide-react";

type AuditLogEntry = {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
};

type AppLogEntry = {
  id: string;
  level: string;
  message: string;
  context: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
};

type LogTab = "audit" | "app";

const actionLabels: Record<string, string> = {
  LOGIN: "Giriş Yaptı",
  REGISTER_VIA_INVITE: "Davet ile Kayıt",
  CANDIDATE_CREATED: "Aday Eklendi",
  INVITE_CREATED: "Davet Oluşturuldu",
  EXAM_INVITE_SENT: "Sınav Daveti Gönderildi",
  FEATURE_ENABLED: "Özellik Açıldı",
  FEATURE_DISABLED: "Özellik Kapatıldı",
};

const levelColors: Record<string, string> = {
  error: "bg-red-100 text-red-800",
  warn: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
  debug: "bg-gray-100 text-gray-800",
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LogViewer() {
  const [tab, setTab] = useState<LogTab>("audit");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [appLogs, setAppLogs] = useState<AppLogEntry[]>([]);
  const [auditCursor, setAuditCursor] = useState<string | null>(null);
  const [appCursor, setAppCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("type", tab);
        if (search) params.set("search", search);
        if (tab === "app" && level && level !== "all") params.set("level", level);
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/settings/logs?${params}`);
        if (!res.ok) return;
        const data = await res.json();

        if (tab === "audit") {
          if (cursor) {
            setAuditLogs((prev) => [...prev, ...data.items]);
          } else {
            setAuditLogs(data.items);
          }
          setAuditCursor(data.nextCursor);
        } else {
          if (cursor) {
            setAppLogs((prev) => [...prev, ...data.items]);
          } else {
            setAppLogs(data.items);
          }
          setAppCursor(data.nextCursor);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [tab, search, level]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchLogs();
  }

  const logs = tab === "audit" ? auditLogs : appLogs;
  const nextCursor = tab === "audit" ? auditCursor : appCursor;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("audit")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "audit"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Kullanıcı İşlemleri
        </button>
        <button
          type="button"
          onClick={() => setTab("app")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "app"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sistem Logları
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {tab === "app" && (
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tüm seviyeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm seviyeler</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button type="submit" variant="outline" size="icon" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </form>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 && !loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {tab === "audit" ? "Henüz kayıtlı işlem yok." : "Henüz sistem logu yok."}
            </p>
          ) : (
            <div className="divide-y">
              {tab === "audit"
                ? (logs as AuditLogEntry[]).map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {actionLabels[log.action] ?? log.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.entity}
                            {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{log.userName ?? "Sistem"}</span>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <span className="text-muted-foreground ml-1">
                              ({Object.entries(log.metadata)
                                .filter(([k]) => k !== "provider")
                                .map(([k, v]) => `${k}: ${String(v)}`)
                                .join(", ")})
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  ))
                : (logs as AppLogEntry[]).map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs ${levelColors[log.level] ?? ""}`}
                            variant="outline"
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                          {log.context && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {log.context}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 break-all">{log.message}</p>
                        {log.data && Object.keys(log.data).length > 0 && (
                          <pre className="text-xs text-muted-foreground mt-1 font-mono bg-muted rounded p-2 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  ))}
            </div>
          )}

          {nextCursor && (
            <div className="border-t p-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => fetchLogs(nextCursor)}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Daha fazla yükle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
