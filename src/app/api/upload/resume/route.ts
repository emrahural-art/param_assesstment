import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
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
