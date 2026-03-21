import { z } from "zod";

export const moveApplicationSchema = z.object({
  applicationId: z.string(),
  newStage: z.enum([
    "NEW_APPLICATION",
    "SCREENING",
    "INTERVIEW",
    "ASSESSMENT",
    "OFFER",
    "HIRED",
    "REJECTED",
  ]),
});

export const createStageSchema = z.object({
  name: z.string().min(2),
  order: z.coerce.number().min(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});
