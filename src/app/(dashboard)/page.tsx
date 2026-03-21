import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/prisma";

const stageLabels: Record<string, string> = {
  NEW_APPLICATION: "Yeni Başvuru",
  SCREENING: "Ön Eleme",
  INTERVIEW: "Mülakat",
  ASSESSMENT: "Değerlendirme",
  OFFER: "Teklif",
  HIRED: "İşe Alındı",
  REJECTED: "Reddedildi",
};

const stageColors: Record<string, string> = {
  NEW_APPLICATION: "bg-blue-500",
  SCREENING: "bg-purple-500",
  INTERVIEW: "bg-amber-500",
  ASSESSMENT: "bg-pink-500",
  OFFER: "bg-green-500",
  HIRED: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

async function getDashboardData() {
  try {
    const [
      candidateCount,
      applicationCount,
      assessmentCount,
      completedTests,
      pipelineCounts,
      recentApplications,
      listingCount,
      emailsSent,
    ] = await Promise.all([
      db.candidate.count({ where: { status: "ACTIVE" } }),
      db.application.count(),
      db.assessment.count({ where: { isActive: true } }),
      db.assessmentResult.count({ where: { completedAt: { not: null } } }),
      db.application.groupBy({
        by: ["stage"],
        _count: { id: true },
      }),
      db.application.findMany({
        take: 5,
        orderBy: { appliedAt: "desc" },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          listing: { select: { title: true } },
        },
      }),
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.communicationLog.count({ where: { status: "SENT" } }),
    ]);

    return {
      candidateCount,
      applicationCount,
      assessmentCount,
      completedTests,
      listingCount,
      emailsSent,
      pipelineCounts: pipelineCounts.map((p) => ({
        stage: p.stage,
        count: p._count.id,
      })),
      recentApplications,
    };
  } catch {
    return {
      candidateCount: 0,
      applicationCount: 0,
      assessmentCount: 0,
      completedTests: 0,
      listingCount: 0,
      emailsSent: 0,
      pipelineCounts: [],
      recentApplications: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const maxCount = Math.max(
    ...data.pipelineCounts.map((p) => p.count),
    1
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { title: "Aktif Adaylar", value: data.candidateCount, href: "/candidates" },
          { title: "Başvurular", value: data.applicationCount, href: "/pipeline" },
          { title: "Açık İlanlar", value: data.listingCount, href: "/listings" },
          { title: "Aktif Testler", value: data.assessmentCount, href: "/assessments" },
          { title: "Tamamlanan Testler", value: data.completedTests, href: "/assessments" },
          { title: "Gönderilen E-posta", value: data.emailsSent, href: "/communication/logs" },
        ].map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pipelineCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Henüz başvuru yok.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.keys(stageLabels).map((stage) => {
                  const item = data.pipelineCounts.find(
                    (p) => p.stage === stage
                  );
                  const count = item?.count ?? 0;
                  const pct = Math.round((count / maxCount) * 100);

                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{stageLabels[stage]}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${stageColors[stage]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Son Başvurular</CardTitle>
              <Link
                href="/candidates"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tümünü gör &rarr;
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Henüz başvuru yok.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {app.candidate.firstName} {app.candidate.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {app.listing.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {stageLabels[app.stage] ?? app.stage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
