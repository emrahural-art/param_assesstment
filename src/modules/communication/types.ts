import { type CommunicationStatus, type EmailTemplateType } from "@/generated/prisma/client";

export type SendEmailInput = {
  candidateId: string;
  templateId?: string;
  subject: string;
  body: string;
};

export type CreateTemplateInput = {
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
};

export type { CommunicationStatus, EmailTemplateType };
