export { sendEmailAction, bulkSendEmailAction, createTemplateAction } from "./actions";
export { getEmailTemplates, getEmailTemplateById, getCommunicationLogs } from "./queries";
export { sendCandidateEmail, createTemplate, updateTemplate, deleteTemplate } from "./service";
export { sendEmailSchema, createTemplateSchema, bulkSendSchema } from "./schema";
export type { SendEmailInput, CreateTemplateInput } from "./types";
