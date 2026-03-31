import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { optionalAuth } from "@/lib/api-auth";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";
import { validateFileSignature } from "@/lib/file-validation";

const FRESH_CANDIDATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  const rl = checkRateLimit(`upload:${getClientId(request)}`, { limit: 10, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const candidateId = formData.get("candidateId") as string | null;

  if (!file || !candidateId) {
    return NextResponse.json(
      { error: "Dosya ve aday ID zorunludur" },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Dosya boyutu 5 MB'dan büyük olamaz" },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Sadece PDF formatı kabul edilmektedir" },
      { status: 400 }
    );
  }

  const fileBuffer = await file.arrayBuffer();
  if (!validateFileSignature(fileBuffer, "pdf")) {
    return NextResponse.json(
      { error: "Geçersiz dosya içeriği: dosya gerçek bir PDF değil" },
      { status: 400 }
    );
  }

  const token = await optionalAuth(request);
  const isStaff = !!token?.sub;

  if (!isStaff) {
    // Public callers may only upload for candidates created in the last 5 min
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      select: { createdAt: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Aday bulunamadı" }, { status: 404 });
    }

    const age = Date.now() - candidate.createdAt.getTime();
    if (age > FRESH_CANDIDATE_WINDOW_MS) {
      return NextResponse.json(
        { error: "Bu aday için CV yükleme süresi dolmuş" },
        { status: 403 },
      );
    }
  }

  try {
    const url = await uploadFile(file, "resumes");

    await db.candidate.update({
      where: { id: candidateId },
      data: { resumeUrl: url },
    });

    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (err) {
    logger.error("Failed to upload resume", "api.upload.resume", { error: String(err) });
    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
