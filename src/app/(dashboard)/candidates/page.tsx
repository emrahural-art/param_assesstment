import Link from "next/link";
import { getCandidates } from "@/modules/candidates/queries";
import { toCandidateDTOList } from "@/modules/candidates/mapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CandidateFilters } from "@/components/candidates/candidate-filters";

const stageLabels: Record<string, string> = {
  NEW_APPLICATION: "Yeni Başvuru",
  SCREENING: "Ön Eleme",
  INTERVIEW: "Mülakat",
  ASSESSMENT: "Değerlendirme Testi",
  OFFER: "Teklif",
  HIRED: "İşe Alındı",
  REJECTED: "Reddedildi",
};

const stageColors: Record<string, string> = {
  NEW_APPLICATION: "bg-blue-100 text-blue-800",
  SCREENING: "bg-purple-100 text-purple-800",
  INTERVIEW: "bg-amber-100 text-amber-800",
  ASSESSMENT: "bg-pink-100 text-pink-800",
  OFFER: "bg-green-100 text-green-800",
  HIRED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const filters = await searchParams;
  let candidates: Awaited<ReturnType<typeof getCandidates>> = [];
  try {
    candidates = await getCandidates({
      search: filters.search,
      status: filters.status as "ACTIVE" | "ARCHIVED" | "ANONYMIZED" | undefined,
      stage: filters.stage,
    });
  } catch {
    // DB not available
  }
  const dtos = toCandidateDTOList(candidates);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Adaylar</h2>
        <div className="flex items-center gap-3">
          <Link href="/pipeline">
            <Button variant="outline" size="sm">
              Kanban Görünümü
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">
            {dtos.length} aday
          </span>
        </div>
      </div>

      <CandidateFilters />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>İlan</TableHead>
              <TableHead>Aşama</TableHead>
              <TableHead>Başvuru Tarihi</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dtos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  Henüz aday bulunmuyor
                </TableCell>
              </TableRow>
            ) : (
              dtos.map((candidate) => {
                const fullCandidate = candidates.find(
                  (c: { id: string }) => c.id === candidate.id
                );
                const app = fullCandidate?.applications[0];
                return (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="hover:underline"
                      >
                        {candidate.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.email}
                    </TableCell>
                    <TableCell>
                      {app ? (
                        <span className="text-sm">
                          {(app.listing as { title: string }).title}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageColors[app.stage] ?? ""}`}
                        >
                          {stageLabels[app.stage] ?? app.stage}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(candidate.appliedAt).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          candidate.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {candidate.status === "ACTIVE" ? "Aktif" : candidate.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
