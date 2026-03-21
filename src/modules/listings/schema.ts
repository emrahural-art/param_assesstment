import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(3, "İlan başlığı en az 3 karakter olmalıdır"),
  description: z.string().optional(),
  requirements: z.string().optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
});
