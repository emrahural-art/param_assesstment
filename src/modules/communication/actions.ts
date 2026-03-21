"use server";

import { revalidatePath } from "next/cache";
import { sendEmailSchema, createTemplateSchema, bulkSendSchema } from "./schema";
import { sendCandidateEmail, createTemplate as createTemplateService } from "./service";

export async function sendEmailAction(data: { candidateId: string; subject: string; body: string; templateId?: string }) {
  const parsed = sendEmailSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await sendCandidateEmail(parsed.data);
    revalidatePath("/candidates");
    return { success: true };
  } catch {
    return { error: "E-posta gönderilirken bir hata oluştu" };
  }
}

export async function bulkSendEmailAction(data: { candidateIds: string[]; subject: string; body: string }) {
  const parsed = bulkSendSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const results = await Promise.allSettled(
    parsed.data.candidateIds.map((candidateId) =>
      sendCandidateEmail({ candidateId, subject: parsed.data.subject, body: parsed.data.body })
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  revalidatePath("/candidates");
  return { success: true, sent: succeeded, total: parsed.data.candidateIds.length };
}

export async function createTemplateAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
  };

  const parsed = createTemplateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await createTemplateService(parsed.data);
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Şablon oluşturulurken bir hata oluştu" };
  }
}
