"use server";

import { revalidatePath } from "next/cache";
import { createCandidateSchema } from "./schema";
import { createCandidate as createCandidateService, updateCandidate as updateCandidateService } from "./service";

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
  } catch {
    return { error: { email: ["Bu e-posta adresi zaten kayıtlı"] } };
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
  } catch {
    return { error: "Aday güncellenirken bir hata oluştu" };
  }
}
