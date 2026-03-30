import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),

  // Email - SMTP (on-premise)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Email - Resend (cloud, fallback)
  RESEND_API_KEY: z.string().optional(),

  // Storage
  UPLOAD_DIR: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Google Sheets API (toplu aday import)
  GOOGLE_SHEETS_API_KEY: z.string().optional(),

  /** Go-live flags; boolean coercion in src/lib/features.ts */
  NEXT_PUBLIC_FEATURE_CANDIDATE_JOBS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CANDIDATE_APPLY: z.string().optional(),
  NEXT_PUBLIC_FEATURE_COMMUNICATION: z.string().optional(),
  NEXT_PUBLIC_FEATURE_PIPELINE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_LISTINGS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
