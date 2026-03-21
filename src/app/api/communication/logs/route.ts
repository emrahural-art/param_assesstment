import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  try {
    const logs = await db.communicationLog.findMany({
      where: candidateId ? { candidateId } : undefined,
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}
