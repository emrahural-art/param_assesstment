import { db } from "@/lib/prisma";
import { type CandidateReportCard, type ShortlistEntry } from "./types";

export async function getCandidateReportCard(candidateId: string): Promise<CandidateReportCard | null> {
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: {
      applications: { include: { listing: true } },
      assessmentResults: { include: { assessment: { include: { questions: true } } } },
      notes: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) return null;

  const ratings = candidate.notes
    .filter((n: { rating: number | null }) => n.rating !== null)
    .map((n: { rating: number | null }) => n.rating!);
  const averageRating =
    ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null;

  return {
    candidateId: candidate.id,
    fullName: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    applications: candidate.applications.map((app: { listing: { title: string }; stage: string; appliedAt: Date }) => ({
      listingTitle: app.listing.title,
      stage: app.stage,
      appliedAt: app.appliedAt.toISOString(),
    })),
    assessmentResults: candidate.assessmentResults.map(
      (r: { assessment: { title: string }; score: number | null; totalPoints: number | null; completedAt: Date | null; violations: unknown }) => {
        return {
          assessmentTitle: r.assessment.title,
          score: r.score,
          totalPoints: r.totalPoints,
          completedAt: r.completedAt?.toISOString() ?? null,
          violations: (r.violations as unknown[]) ?? [],
        };
      }
    ),
    notes: candidate.notes.map((n: { user: { name: string }; content: string; rating: number | null; createdAt: Date }) => ({
      authorName: n.user.name,
      content: n.content,
      rating: n.rating,
      createdAt: n.createdAt.toISOString(),
    })),
    averageRating,
  };
}

export async function getShortlist(listingId: string): Promise<ShortlistEntry[]> {
  const applications = await db.application.findMany({
    where: { listingId },
    include: {
      candidate: {
        include: {
          assessmentResults: true,
          notes: true,
        },
      },
    },
  });

  return applications.map((app: { candidate: { id: string; firstName: string; lastName: string; assessmentResults: { score: number | null; totalPoints: number | null }[]; notes: { rating: number | null }[] }; stage: string }) => {
    const latestResult = app.candidate.assessmentResults[0];
    const ratings = app.candidate.notes
      .filter((n: { rating: number | null }) => n.rating !== null)
      .map((n: { rating: number | null }) => n.rating!);
    const averageRating =
      ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null;

    return {
      candidateId: app.candidate.id,
      fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      assessmentScore: latestResult?.score ?? null,
      assessmentTotal: latestResult?.totalPoints ?? null,
      averageRating,
      stage: app.stage,
    };
  });
}
