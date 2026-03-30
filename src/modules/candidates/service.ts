import { db } from "@/lib/prisma";
import { Prisma, type Company } from "@/generated/prisma/client";
import { type CreateCandidateInput, type BulkCandidateRow, type BulkCreateResult } from "./types";
import { COMPANY_VALUES } from "./schema";

export async function createCandidate(input: CreateCandidateInput) {
  return db.candidate.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      company: input.company,
      position: input.position,
      department: input.department,
      resumeUrl: input.resumeUrl,
      cvData: input.cvData ? (input.cvData as Prisma.InputJsonValue) : Prisma.JsonNull,
      consentAt: input.consentAt ?? new Date(),
    },
  });
}

export async function bulkCreateCandidates(
  rows: BulkCandidateRow[],
  userId?: string,
): Promise<BulkCreateResult> {
  const result: BulkCreateResult = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const existing = await db.candidate.findUnique({
        where: { email: row.email.toLowerCase().trim() },
      });

      if (existing) {
        result.skipped++;
        result.errors.push({
          row: i + 1,
          email: row.email,
          message: "Bu e-posta adresi zaten kayıtlı",
        });
        continue;
      }

      const companyUpper = row.company?.toUpperCase().trim();
      const company: Company | undefined =
        companyUpper && (COMPANY_VALUES as readonly string[]).includes(companyUpper)
          ? (companyUpper as Company)
          : undefined;

      const candidate = await db.candidate.create({
        data: {
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          email: row.email.toLowerCase().trim(),
          phone: row.phone?.trim() || null,
          company,
          position: row.position?.trim() || null,
          department: row.department?.trim() || null,
          consentAt: new Date(),
        },
      });

      if (row.note?.trim() && userId) {
        await db.candidateNote.create({
          data: {
            candidateId: candidate.id,
            userId,
            content: row.note.trim(),
          },
        });
      }

      result.imported++;
    } catch (err) {
      result.errors.push({
        row: i + 1,
        email: row.email,
        message: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    }
  }

  return result;
}

export async function updateCandidate(id: string, input: Record<string, unknown>) {
  const { cvData, ...rest } = input;
  return db.candidate.update({
    where: { id },
    data: {
      ...rest,
      ...(cvData !== undefined && {
        cvData: cvData ? (cvData as Prisma.InputJsonValue) : Prisma.JsonNull,
      }),
    },
  });
}

export async function deleteCandidate(id: string) {
  return db.candidate.delete({ where: { id } });
}

export async function anonymizeCandidate(id: string) {
  return db.candidate.update({
    where: { id },
    data: {
      firstName: "Anonim",
      lastName: "Kullanıcı",
      email: `anonymized-${id}@deleted.local`,
      phone: null,
      resumeUrl: null,
      cvData: Prisma.JsonNull,
      status: "ANONYMIZED",
    },
  });
}
