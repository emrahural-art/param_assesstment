import Link from "next/link";
import { getShortlist } from "@/modules/evaluation/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const stageLabels: Record<string, string> = {
  NEW_APPLICATION: "Yeni Başvuru",
  SCREENING: "Ön Eleme",
  INTERVIEW: "Mülakat",
  ASSESSMENT: "Değerlendirme",
  OFFER: "Teklif",
  HIRED: "İşe Alındı",
  REJECTED: "Reddedildi",
};

export default async function ShortlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing: { id: string; title: string } | null = null;
  let shortlist: Awaited<ReturnType<typeof getShortlist>> = [];

  try {
    listing = await db.listing.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (listing) {
      shortlist = await getShortlist(id);
    }
  } catch {
    // DB not available
  }

  const sorted = [...shortlist].sort((a, b) => {
    const scoreA =
      a.assessmentScore !== null && a.assessmentTotal
        ? a.assessmentScore / a.assessmentTotal
        : 0;
    const scoreB =
      b.assessmentScore !== null && b.assessmentTotal
        ? b.assessmentScore / b.assessmentTotal
        : 0;
    const ratingA = a.averageRating ?? 0;
    const ratingB = b.averageRating ?? 0;
    const compositeA = scoreA * 0.6 + (ratingA / 10) * 0.4;
    const compositeB = scoreB * 0.6 + (ratingB / 10) * 0.4;
    return compositeB - compositeA;
  });

  return (
    <div className="space-y-6">
      <Link
        href={listing ? `/listings/${listing.id}` : "/listings"}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; İlan Detayı
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aday Karşılaştırma</h2>
          {listing && (
            <p className="text-muted-foreground mt-1">{listing.title}</p>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {sorted.length} aday
        </span>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Bu ilana henüz başvuru yok.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Test Puanı</TableHead>
                <TableHead>Başarı %</TableHead>
                <TableHead>Ort. Değerlendirme</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead>Aşama</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry, index) => {
                const pct =
                  entry.assessmentScore !== null && entry.assessmentTotal
                    ? Math.round(
                        (entry.assessmentScore / entry.assessmentTotal) * 100
                      )
                    : null;
                const testNorm = pct !== null ? pct / 100 : 0;
                const ratingNorm = entry.averageRating
                  ? entry.averageRating / 10
                  : 0;
                const composite = Math.round(
                  (testNorm * 0.6 + ratingNorm * 0.4) * 100
                );

                return (
                  <TableRow key={entry.candidateId}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/candidates/${entry.candidateId}`}
                        className="hover:underline"
                      >
                        {entry.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {entry.assessmentScore !== null &&
                      entry.assessmentTotal !== null ? (
                        <span>
                          {entry.assessmentScore}/{entry.assessmentTotal}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pct !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 70
                                  ? "bg-green-500"
                                  : pct >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm">%{pct}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.averageRating !== null ? (
                        <span className="font-medium">
                          {entry.averageRating.toFixed(1)}/10
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          composite >= 70
                            ? "default"
                            : composite >= 40
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {composite}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {stageLabels[entry.stage] ?? entry.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/candidates/${entry.candidateId}/report`}>
                        <Button variant="ghost" size="sm">
                          Karne
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
