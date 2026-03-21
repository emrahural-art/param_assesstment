import { z } from "zod";

export const sendEmailSchema = z.object({
  candidateId: z.string(),
  templateId: z.string().optional(),
  subject: z.string().min(1, "Konu zorunludur"),
  body: z.string().min(1, "İçerik zorunludur"),
});

export const createTemplateSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["POSITIVE", "NEGATIVE", "INVITATION", "TEST_INVITE", "CUSTOM"]),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const bulkSendSchema = z.object({
  candidateIds: z.array(z.string()).min(1),
  templateId: z.string().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
});
