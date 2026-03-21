import { db } from "@/lib/prisma";
import { type ApplicationStage } from "@/generated/prisma/client";

export async function getPipelineStages() {
  return db.pipelineStage.findMany({ orderBy: { order: "asc" } });
}

export async function getApplicationsByStage(stage: ApplicationStage) {
  return db.application.findMany({
    where: { stage },
    include: {
      candidate: true,
      listing: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPipelineOverview() {
  const stages = await db.pipelineStage.findMany({ orderBy: { order: "asc" } });
  const counts = await db.application.groupBy({
    by: ["stage"],
    _count: { id: true },
  });

  return stages.map((stage: { name: string; id: string; order: number; color: string }) => ({
    ...stage,
    candidateCount:
      counts.find((c: { stage: ApplicationStage; _count: { id: number } }) => c.stage === stage.name)
        ?._count.id ?? 0,
  }));
}
