"use server";

import { revalidatePath } from "next/cache";
import { createListingSchema } from "./schema";
import { createListing as createListingService } from "./service";

export async function createListingAction(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    requirements: formData.get("requirements") as string,
  };

  const parsed = createListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await createListingService(parsed.data);
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "İlan oluşturulurken bir hata oluştu" };
  }
}
