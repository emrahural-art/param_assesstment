import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidateById } from "@/modules/candidates/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateHeader } from "@/components/candidates/candidate-header";
import { AnswerKeySection } from "@/components/candidates/answer-key-section";
import { logger } from "@/lib/logger";
/* PHASE_2: Başvurular, CV, Notlar, İletişim tab'ları açıldığında gerekecek
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddNoteForm } from "@/components/candidates/add-note-form";
*/

/* PHASE_2: Başvurular tab'ı açıldığında gerekecek
const stageLabels: Record<string, string> = {
  NEW_APPLICATION: "Yeni Başvuru",
  SCREENING: "Ön Eleme",
  INTERVIEW: "Mülakat",
  ASSESSMENT: "Değerlendirme Testi",
  OFFER: "Teklif",
  HIRED: "İşe Alındı",
  REJECTED: "Reddedildi",
};
*/

const inviteStatusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  STARTED: "Başladı",
  COMPLETED: "Tamamlandı",
  EXPIRED: "Süresi Dolmuş",
};

const inviteStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  STARTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

function formatDate(date: Date | string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type InviteData = {
  id: string;
  assessmentId: string;
  status: string;
  sentAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  assessment: { id: string; title: string };
};

type QuestionData = {
  id: string;
  text: string;
  options: unknown;
  correctAnswer: string | null;
  category: string | null;
  points: number;
  order: number;
};

type ResultData = {
  id: string;
  assessmentId: string;
  score: number | null;
  totalPoints: number | null;
  level: string | null;
  completedAt: Date | null;
  categoryScores: unknown;
  jobFitResults: unknown;
  dimensionResults: unknown;
  answers: unknown;
  assessment: { title: string; questions: QuestionData[] };
};

function TestLifecycleSection({
  examInvites,
  assessmentResults,
}: {
  examInvites: InviteData[];
  assessmentResults: ResultData[];
}) {
  const resultsByAssessment = new Map<string, ResultData>();
  for (const r of assessmentResults) {
    resultsByAssessment.set(r.assessmentId, r);
  }

  const seenAssessmentIds = new Set<string>();

  type MergedItem = {
    key: string;
    title: string;
    invite: InviteData | null;
    result: ResultData | null;
  };

  const merged: MergedItem[] = [];

  for (const inv of examInvites) {
    seenAssessmentIds.add(inv.assessmentId);
    merged.push({
      key: `inv-${inv.id}`,
      title: inv.assessment.title,
      invite: inv,
      result: resultsByAssessment.get(inv.assessmentId) ?? null,
    });
  }

  for (const res of assessmentResults) {
    if (!seenAssessmentIds.has(res.assessmentId)) {
      merged.push({
        key: `res-${res.id}`,
        title: res.assessment.title,
        invite: null,
        result: res,
      });
    }
  }

  if (merged.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Testler</h3>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Henüz test daveti veya sonucu yok.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Testler</h3>
      {merged.map(({ key, title, invite, result }) => {
        const catScores = result?.categoryScores as Record<string, number> | null;
        const jobFit = result?.jobFitResults as { role: string; result: string }[] | null;
        const dims = result?.dimensionResults as { name: string; label: string }[] | null;

        return (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                <div className="flex items-center gap-2">
                  {invite && (
                    <Badge
                      className={`text-xs ${inviteStatusColors[invite.status] ?? ""}`}
                      variant="outline"
                    >
                      {inviteStatusLabels[invite.status] ?? invite.status}
                    </Badge>
                  )}
                  {result?.level && (
                    <Badge variant="default">{result.level}</Badge>
                  )}
                  {result?.score !== null && result?.score !== undefined &&
                    result?.totalPoints !== null && result?.totalPoints !== undefined && (
                    <span className="text-lg font-bold">
                      {result.score}/{result.totalPoints}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timeline */}
              <div className="space-y-2">
                {invite && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
                      <span className="text-muted-foreground w-24 shrink-0">Davet</span>
                      <span>{formatDate(invite.createdAt)}</span>
                      {invite.sentAt ? (
                        <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 ml-auto">
                          E-posta Gönderildi
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 ml-auto">
                          E-posta Bekliyor
                        </Badge>
                      )}
                    </div>
                    {invite.startedAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-muted-foreground w-24 shrink-0">Başlangıç</span>
                        <span>{formatDate(invite.startedAt)}</span>
                      </div>
                    )}
                    {invite.completedAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-muted-foreground w-24 shrink-0">Tamamlandı</span>
                        <span>{formatDate(invite.completedAt)}</span>
                      </div>
                    )}
                  </>
                )}
                {!invite && result?.completedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Tamamlandı</span>
                    <span>{formatDate(result.completedAt)}</span>
                  </div>
                )}
                {!invite && !result?.completedAt && result && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-muted-foreground w-24 shrink-0">Durum</span>
                    <span>Devam ediyor</span>
                  </div>
                )}
              </div>

              {/* Score details */}
              {catScores && Object.keys(catScores).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Kategori Puanları</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.entries(catScores).map(([cat, score]) => (
                      <div
                        key={cat}
                        className="rounded-lg border px-3 py-2 text-center"
                      >
                        <p className="text-xs text-muted-foreground">{cat}</p>
                        <p className="text-lg font-bold">{score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jobFit && jobFit.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Pozisyon Uygunluğu</p>
                  <div className="flex flex-wrap gap-2">
                    {jobFit.map((jf, i) => (
                      <Badge
                        key={i}
                        variant={jf.result === "UYGUN" ? "default" : "destructive"}
                      >
                        {jf.role}: {jf.result}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {dims && dims.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Boyut Değerlendirmesi</p>
                  <div className="flex flex-wrap gap-2">
                    {dims.map((d, i) => (
                      <Badge key={i} variant="outline">
                        {d.name}: {d.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result && result.assessment.questions.length > 0 && (
                <AnswerKeySection
                  questions={result.assessment.questions as { id: string; text: string; options: string[] | null; correctAnswer: string | null; category: string | null; points: number; order: number }[]}
                  answers={(result.answers as { questionId: string; answer: string }[]) ?? []}
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let candidate: Awaited<ReturnType<typeof getCandidateById>> = null;

  try {
    candidate = await getCandidateById(id);
  } catch (err) {
    logger.error("Failed to load candidate", "candidate-detail.page", { error: String(err), candidateId: id });
  }

  if (!candidate) return notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/candidates"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Adaylar
      </Link>

      {/* Künye */}
      <CandidateHeader candidate={candidate} />
      {/* PHASE_2: Evaluation modülü aktif olduğunda açılacak
      <Link href={`/candidates/${candidate.id}/report`}>
        <Button variant="outline" size="sm">
          360° Karne
        </Button>
      </Link>
      */}

      {/* Testler - Lifecycle */}
      <TestLifecycleSection
        examInvites={candidate.examInvites}
        assessmentResults={candidate.assessmentResults}
      />

      {/* PHASE_2: Başvurular (Genel Bakış tab'ı)
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Başvurular</h3>
        <Card>
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
      </div>
      */}

      {/* PHASE_2: CV Bilgileri tab'ı
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">CV Bilgileri</h3>
        ... eğitim, deneyim, yetenekler ...
      </div>
      */}

      {/* PHASE_2: Mülakat Notları tab'ı
      <AddNoteForm candidateId={candidate.id} />
      <Card>
        <CardHeader><CardTitle>Mülakat Notları</CardTitle></CardHeader>
        <CardContent>... notlar ...</CardContent>
      </Card>
      */}

      {/* PHASE_2: İletişim Geçmişi tab'ı
      <Card>
        <CardHeader><CardTitle>İletişim Geçmişi</CardTitle></CardHeader>
        <CardContent>... iletişim logları ...</CardContent>
      </Card>
      */}
    </div>
  );
}
