import { NextResponse } from "next/server";
import { getCandidateReportCard } from "@/modules/evaluation/queries";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const report = await getCandidateReportCard(id);
    if (!report) {
      return NextResponse.json(
        { error: "Aday bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(report);
  } catch (err) {
    logger.error("Failed to load candidate report", "api.candidates.report", { error: String(err) });
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}
