"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Log = {
  id: string;
  subject: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  createdAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

const statusLabels: Record<string, string> = {
  QUEUED: "Kuyrukta",
  SENT: "Gönderildi",
  DELIVERED: "Teslim Edildi",
  OPENED: "Açıldı",
  FAILED: "Başarısız",
};

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  QUEUED: "secondary",
  SENT: "default",
  DELIVERED: "default",
  OPENED: "default",
  FAILED: "destructive",
};

export default function CommunicationLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/communication/logs")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Yükleniyor...</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/communication"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; İletişim Merkezi
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gönderim Logları</h2>
        <span className="text-sm text-muted-foreground">
          {logs.length} kayıt
        </span>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Henüz gönderim kaydı yok.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alıcı</TableHead>
                <TableHead>Konu</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Gönderim</TableHead>
                <TableHead>Açılma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {log.candidate.firstName} {log.candidate.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.candidate.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{log.subject}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[log.status]}>
                      {statusLabels[log.status] ?? log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleString("tr-TR")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.openedAt
                      ? new Date(log.openedAt).toLocaleString("tr-TR")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
