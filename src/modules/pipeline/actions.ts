"use server";

import { revalidatePath } from "next/cache";
import { moveApplicationSchema } from "./schema";
import { moveApplication as moveApplicationService } from "./service";

export async function moveApplicationAction(applicationId: string, newStage: string) {
  const parsed = moveApplicationSchema.safeParse({ applicationId, newStage });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await moveApplicationService(parsed.data.applicationId, parsed.data.newStage);
    revalidatePath("/candidates");
    return { success: true };
  } catch {
    return { error: "Aday aşaması güncellenirken bir hata oluştu" };
  }
}
