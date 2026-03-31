import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { features } from "@/lib/features-env";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";

const applicationSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.enum(["PARAM", "PARAMTECH", "FINROTA", "KREDIM", "UNIVERA"]).optional(),
  listingId: z.string(),
  cvData: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const rl = checkRateLimit(`apply:${getClientId(request)}`, { limit: 5, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Çok fazla başvuru, lütfen bekleyin" }, { status: 429 });
  }

  if (!features.candidateApply) {
    return NextResponse.json({ error: "Bu özellik devre dışı" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = applicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const listing = await db.listing.findUnique({
      where: { id: parsed.data.listingId, status: "PUBLISHED" },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Bu ilan bulunamadı veya başvuruya kapalı" },
        { status: 404 }
      );
    }

    let candidate = await db.candidate.findUnique({
      where: { email: parsed.data.email },
    });

    if (!candidate) {
      candidate = await db.candidate.create({
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          company: parsed.data.company,
          cvData: parsed.data.cvData
            ? (parsed.data.cvData as Prisma.InputJsonValue)
            : undefined,
          consentAt: new Date(),
        },
      });
    }

    const existingApplication = await db.application.findUnique({
      where: {
        candidateId_listingId: {
          candidateId: candidate.id,
          listingId: parsed.data.listingId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Bu ilana zaten başvurdunuz" },
        { status: 409 }
      );
    }

    await db.application.create({
      data: {
        candidateId: candidate.id,
        listingId: parsed.data.listingId,
        stage: "NEW_APPLICATION",
      },
    });

    return NextResponse.json(
      { success: true, candidateId: candidate.id },
      { status: 201 }
    );
  } catch (err) {
    logger.error("Failed to process application", "api.applications.POST", { error: String(err) });
    return NextResponse.json(
      { error: "Başvuru işlenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
