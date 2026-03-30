"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createNoteSchema } from "./schema";
import { createNote as createNoteService } from "./service";
import { logger } from "@/lib/logger";

export async function createNoteAction(data: { candidateId: string; content: string; rating?: number }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Oturum açmanız gerekiyor" };
  }

  const parsed = createNoteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await createNoteService(session.user.id, parsed.data.candidateId, parsed.data.content, parsed.data.rating);
    revalidatePath(`/candidates/${parsed.data.candidateId}`);
    return { success: true };
  } catch (err) {
    logger.error("Failed to add note", "evaluation.actions", { error: String(err) });
    return { error: "Not eklenirken bir hata oluştu" };
  }
}
