import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidateReportCard } from "@/modules/evaluation/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const stageLabels: Record<string, string> = {
  NEW_APPLICATION: "Yeni Başvuru",
  SCREENING: "Ön Eleme",
  INTERVIEW: "Mülakat",
  ASSESSMENT: "Değerlendirme",
  OFFER: "Teklif",
  HIRED: "İşe Alındı",
  REJECTED: "Reddedildi",
};

export default async function CandidateReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let report: Awaited<ReturnType<typeof getCandidateReportCard>> = null;

  try {
    report = await getCandidateReportCard(id);
  } catch {
    // DB not available
  }

  if (!report) return notFound();

  const totalTestScore = report.assessmentResults.reduce(
    (sum, r) => sum + (r.score ?? 0),
    0
  );
  const totalTestMax = report.assessmentResults.reduce(
    (sum, r) => sum + (r.totalPoints ?? 0),
    0
  );
  const testPercentage =
    totalTestMax > 0 ? Math.round((totalTestScore / totalTestMax) * 100) : null;

  const totalViolations = report.assessmentResults.reduce(
    (sum, r) => sum + r.violations.length,
    0
  );

  return (
    <div className="space-y-6">
      <Link
        href={`/candidates/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Aday Detayı
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">360° Aday Karnesi</h2>
        <p className="text-lg text-muted-foreground mt-1">
          {report.fullName}
        </p>
        <p className="text-sm text-muted-foreground">{report.email}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {testPercentage !== null ? `%${testPercentage}` : "-"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Test Başarısı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {report.averageRating !== null
                ? report.averageRating.toFixed(1)
                : "-"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Ort. Değerlendirme /10
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{report.notes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Mülakat Notu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p
              className={`text-3xl font-bold ${totalViolations > 0 ? "text-destructive" : ""}`}
            >
              {totalViolations}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Sınav İhlali</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Başvurular</CardTitle>
        </CardHeader>
        <CardContent>
          {report.applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Başvuru yok.</p>
          ) : (
            <div className="space-y-2">
              {report.applications.map((app, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{app.listingTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {stageLabels[app.stage] ?? app.stage}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Sonuçları</CardTitle>
        </CardHeader>
        <CardContent>
          {report.assessmentResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">Test sonucu yok.</p>
          ) : (
            <div className="space-y-3">
              {report.assessmentResults.map((r, i) => {
                const pct =
                  r.totalPoints && r.score !== null
                    ? Math.round((r.score / r.totalPoints) * 100)
                    : null;
                return (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{r.assessmentTitle}</p>
                      <div className="flex items-center gap-2">
                        {r.score !== null && r.totalPoints !== null && (
                          <span className="text-lg font-bold">
                            {r.score}/{r.totalPoints}
                          </span>
                        )}
                        {pct !== null && (
                          <Badge
                            variant={
                              pct >= 70
                                ? "default"
                                : pct >= 40
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            %{pct}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Score bar */}
                    {pct !== null && (
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 70
                              ? "bg-green-500"
                              : pct >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {r.completedAt
                          ? new Date(r.completedAt).toLocaleDateString("tr-TR")
                          : "Devam ediyor"}
                      </span>
                      {r.violations.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {r.violations.length} ihlal
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mülakat Notları</CardTitle>
        </CardHeader>
        <CardContent>
          {report.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not yok.</p>
          ) : (
            <div className="space-y-3">
              {report.notes.map((note, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {note.authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      {note.rating && (
                        <Badge variant="secondary">{note.rating}/10</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
