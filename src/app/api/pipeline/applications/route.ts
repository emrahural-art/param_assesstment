import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

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
  } catch {
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}
