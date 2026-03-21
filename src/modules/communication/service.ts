import { db } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { eventBus } from "@/lib/events";
import { type SendEmailInput, type CreateTemplateInput } from "./types";

export async function sendCandidateEmail(input: SendEmailInput) {
  const candidate = await db.candidate.findUnique({ where: { id: input.candidateId } });
  if (!candidate) throw new Error("Candidate not found");

  const log = await db.communicationLog.create({
    data: {
      candidateId: input.candidateId,
      templateId: input.templateId,
      subject: input.subject,
      body: input.body,
      status: "QUEUED",
    },
  });

  const result = await sendEmail({
    to: candidate.email,
    subject: input.subject,
    html: input.body,
  });

  await db.communicationLog.update({
    where: { id: log.id },
    data: {
      status: result.success ? "SENT" : "FAILED",
      sentAt: result.success ? new Date() : undefined,
    },
  });

  if (result.success) {
    await eventBus.emit("email.sent", {
      candidateId: input.candidateId,
      templateType: "CUSTOM",
    });
  }

  return { ...log, status: result.success ? "SENT" : "FAILED" };
}

export async function createTemplate(input: CreateTemplateInput) {
  return db.emailTemplate.create({ data: input });
}

export async function updateTemplate(id: string, input: Partial<CreateTemplateInput>) {
  return db.emailTemplate.update({ where: { id }, data: input });
}

export async function deleteTemplate(id: string) {
  return db.emailTemplate.delete({ where: { id } });
}
