import { z } from "zod";

export const COMPANY_VALUES = ["PARAM", "PARAMTECH", "FINROTA", "KREDIM", "UNIVERA"] as const;

// 05XX XXX XX XX, 5XXXXXXXXX, +905XXXXXXXXX, +90 5XX ... gibi formatları kabul eder
const PHONE_REGEX = /^(\+90\s?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
const PHONE_ERROR = "Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)";

const phoneField = z
  .string()
  .regex(PHONE_REGEX, PHONE_ERROR)
  .optional()
  .or(z.literal(""));

export const createCandidateSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: phoneField,
  company: z.enum(COMPANY_VALUES).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: "KVKK onayı zorunludur",
  }),
});

export const hrCreateCandidateSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: phoneField,
  company: z.enum(COMPANY_VALUES).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  note: z.string().optional(),
});

export const bulkCandidateRowSchema = z.object({
  firstName: z.string().min(1, "İsim zorunludur"),
  lastName: z.string().min(1, "Soyisim zorunludur"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: phoneField,
  company: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  note: z.string().optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial().omit({
  consentAccepted: true,
});

export const candidateFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "ANONYMIZED"]).optional(),
  stage: z.string().optional(),
  listingId: z.string().optional(),
  company: z.enum(COMPANY_VALUES).optional(),
  department: z.string().optional(),
});
