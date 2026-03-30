"use server";

import { revalidatePath } from "next/cache";
import { createCandidateSchema } from "./schema";
import { createCandidate as createCandidateService, updateCandidate as updateCandidateService } from "./service";
import { logger } from "@/lib/logger";

export async function createCandidateAction(formData: FormData) {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    consentAccepted: formData.get("consentAccepted") === "true",
  };

  const parsed = createCandidateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await createCandidateService({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      consentAt: new Date(),
    });

    revalidatePath("/candidates");
    return { success: true };
  } catch (err) {
    logger.error("Failed to create candidate", "candidates.actions", { error: String(err) });
    const isUniqueConstraint =
      err instanceof Error && err.message.includes("Unique constraint failed");
    if (isUniqueConstraint) {
      return { error: { email: ["Bu e-posta adresi zaten kayıtlı"] } };
    }
    return { error: { email: ["Aday eklenirken bir hata oluştu"] } };
  }
}

export async function updateCandidateAction(id: string, formData: FormData) {
  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (value) data[key] = value as string;
  });

  try {
    await updateCandidateService(id, data);
    revalidatePath("/candidates");
    revalidatePath(`/candidates/${id}`);
    return { success: true };
  } catch (err) {
    logger.error("Failed to update candidate", "candidates.actions", { error: String(err) });
    return { error: "Aday güncellenirken bir hata oluştu" };
  }
}
