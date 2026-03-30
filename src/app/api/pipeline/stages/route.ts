import { NextResponse } from "next/server";
import { getPipelineOverview } from "@/modules/pipeline/queries";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const stages = await getPipelineOverview();
    return NextResponse.json(stages);
  } catch (err) {
    logger.error("Failed to load pipeline stages", "api.pipeline.stages", { error: String(err) });
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı" }, { status: 503 });
  }
}
