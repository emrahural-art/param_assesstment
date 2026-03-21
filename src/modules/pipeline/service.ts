import { db } from "@/lib/prisma";
import { eventBus } from "@/lib/events";
import { type ApplicationStage } from "@/generated/prisma/client";

export async function moveApplication(applicationId: string, newStage: ApplicationStage) {
  const application = await db.application.update({
    where: { id: applicationId },
    data: { stage: newStage },
  });

  await eventBus.emit("candidate.stageChanged", {
    applicationId,
    candidateId: application.candidateId,
    newStage,
  });

  return application;
}

export async function createApplication(candidateId: string, listingId: string) {
  return db.application.create({
    data: { candidateId, listingId, stage: "NEW_APPLICATION" },
  });
}
