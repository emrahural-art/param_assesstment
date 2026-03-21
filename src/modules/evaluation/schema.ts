import { z } from "zod";

export const createNoteSchema = z.object({
  candidateId: z.string(),
  content: z.string().min(1, "Not içeriği boş olamaz"),
  rating: z.coerce.number().min(1).max(10).optional(),
});
