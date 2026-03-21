import { z } from "zod";

export const createCandidateSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().optional(),
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: "KVKK onayı zorunludur",
  }),
});

export const updateCandidateSchema = createCandidateSchema.partial().omit({
  consentAccepted: true,
});

export const candidateFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "ANONYMIZED"]).optional(),
  stage: z.string().optional(),
  listingId: z.string().optional(),
});
