import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCandidates } from "@/modules/candidates/queries";
import { createCandidate } from "@/modules/candidates/service";
import { hrCreateCandidateSchema } from "@/modules/candidates/schema";
import { toCandidateDTOList } from "@/modules/candidates/mapper";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { auditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as "ACTIVE" | "ARCHIVED" | "ANONYMIZED") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    listingId: searchParams.get("listingId") ?? undefined,
    company: (searchParams.get("company") as "PARAM" | "PARAMTECH" | "FINROTA" | "KREDIM" | "UNIVERA") ?? undefined,
    department: searchParams.get("department") ?? undefined,
  };

  try {
    const candidates = await getCandidates(filters);
    return NextResponse.json(toCandidateDTOList(candidates));
  } catch (err) {
    logger.error("Failed to load candidates", "api.candidates.GET", { error: String(err) });
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = hrCreateCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const { note, ...candidateData } = parsed.data;

    const candidate = await createCandidate({
      ...candidateData,
      consentAt: new Date(),
    });

    if (note?.trim()) {
      const token = await getToken({ req: request as never, secret: process.env.AUTH_SECRET });
      if (token?.sub) {
        await db.candidateNote.create({
          data: {
            candidateId: candidate.id,
            userId: token.sub,
            content: note.trim(),
          },
        });
      }
    }

    const token2 = await getToken({ req: request as never, secret: process.env.AUTH_SECRET });
    auditLog({
      userId: token2?.sub ?? null,
      userName: (token2?.name as string) ?? null,
      action: "CANDIDATE_CREATED",
      entity: "Candidate",
      entityId: candidate.id,
      metadata: { email: candidateData.email },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (err) {
    logger.error("Failed to create candidate", "api.candidates.POST", { error: String(err) });
    const isUniqueConstraint =
      err instanceof Error && err.message.includes("Unique constraint failed");
    if (isUniqueConstraint) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ error: "Aday eklenirken bir hata oluştu" }, { status: 500 });
  }
}
