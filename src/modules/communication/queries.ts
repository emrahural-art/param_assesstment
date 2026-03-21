import { db } from "@/lib/prisma";

export async function getEmailTemplates() {
  return db.emailTemplate.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getEmailTemplateById(id: string) {
  return db.emailTemplate.findUnique({ where: { id } });
}

export async function getCommunicationLogs(candidateId: string) {
  return db.communicationLog.findMany({
    where: { candidateId },
    orderBy: { createdAt: "desc" },
  });
}
