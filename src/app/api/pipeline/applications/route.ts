import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const applications = await db.application.findMany({
      include: {
        candidate: true,
        listing: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (err) {
    logger.error("Failed to load pipeline applications", "api.pipeline.applications", { error: String(err) });
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}
