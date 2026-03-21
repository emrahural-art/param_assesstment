import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidateById } from "@/modules/candidates/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddNoteForm } from "@/components/candidates/add-note-form";

const stageLabels: Record<string, string> = {
  NEW_APPLICATION: "Yeni Başvuru",
  SCREENING: "Ön Eleme",
  INTERVIEW: "Mülakat",
  ASSESSMENT: "Değerlendirme Testi",
  OFFER: "Teklif",
  HIRED: "İşe Alındı",
  REJECTED: "Reddedildi",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let candidate: Awaited<ReturnType<typeof getCandidateById>> = null;

  try {
    candidate = await getCandidateById(id);
  } catch {
    // DB not available
  }

  if (!candidate) return notFound();

  const cvData = candidate.cvData as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <Link
        href="/candidates"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Adaylar
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {candidate.firstName} {candidate.lastName}
          </h2>
          <p className="text-muted-foreground">{candidate.email}</p>
          {candidate.phone && (
            <p className="text-sm text-muted-foreground">{candidate.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/candidates/${candidate.id}/report`}>
            <Button variant="outline" size="sm">
              360° Karne
            </Button>
          </Link>
          <Badge variant={candidate.status === "ACTIVE" ? "default" : "secondary"}>
            {candidate.status === "ACTIVE" ? "Aktif" : candidate.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="cv">CV Bilgileri</TabsTrigger>
          <TabsTrigger value="tests">Testler</TabsTrigger>
          <TabsTrigger value="notes">Notlar</TabsTrigger>
          <TabsTrigger value="communication">İletişim</TabsTrigger>
        </TabsList>

        {/* Genel Bakış */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Başvurular</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Başvuru yok.</p>
              ) : (
                <div className="space-y-3">
                  {candidate.applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{app.listing.title}</p>
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

          {candidate.resumeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CV Dosyası</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  CV&apos;yi İndir / Görüntüle
                </a>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CV Bilgileri */}
        <TabsContent value="cv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eğitim</CardTitle>
            </CardHeader>
            <CardContent>
              {(cvData?.education as Array<Record<string, string>>)?.length ? (
                <div className="space-y-3">
                  {(cvData!.education as Array<Record<string, string>>).map(
                    (edu, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <p className="font-medium">{edu.school}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.degree} - {edu.field}
                        </p>
                        {edu.graduationYear && (
                          <p className="text-xs text-muted-foreground">
                            Mezuniyet: {edu.graduationYear}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Eğitim bilgisi girilmemiş.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İş Deneyimi</CardTitle>
            </CardHeader>
            <CardContent>
              {(cvData?.experience as Array<Record<string, string>>)?.length ? (
                <div className="space-y-3">
                  {(cvData!.experience as Array<Record<string, string>>).map(
                    (exp, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.endDate || "Devam ediyor"}
                        </p>
                        {exp.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Deneyim bilgisi girilmemiş.
                </p>
              )}
            </CardContent>
          </Card>

          {(cvData?.skills as string[])?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yetenekler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(cvData!.skills as string[]).map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Testler */}
        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Sonuçları</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.assessmentResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz test sonucu yok.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidate.assessmentResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{result.assessment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.completedAt
                            ? new Date(result.completedAt).toLocaleDateString("tr-TR")
                            : "Devam ediyor"}
                        </p>
                      </div>
                      {result.score !== null && result.totalPoints !== null && (
                        <span className="text-lg font-bold">
                          {result.score}/{result.totalPoints}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notlar */}
        <TabsContent value="notes" className="space-y-4">
          <AddNoteForm candidateId={candidate.id} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mülakat Notları</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz not eklenmemiş.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidate.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {note.user.name}
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
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* İletişim */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İletişim Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.communications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz iletişim kaydı yok.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidate.communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{comm.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {comm.sentAt
                            ? new Date(comm.sentAt).toLocaleDateString("tr-TR")
                            : "Gönderilmedi"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          comm.status === "OPENED"
                            ? "default"
                            : comm.status === "SENT"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {comm.status === "OPENED"
                          ? "Açıldı"
                          : comm.status === "SENT"
                            ? "Gönderildi"
                            : comm.status === "QUEUED"
                              ? "Kuyrukta"
                              : "Hata"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
