import { NextResponse } from "next/server";
import { getPipelineOverview } from "@/modules/pipeline/queries";

export async function GET() {
  try {
    const stages = await getPipelineOverview();
    return NextResponse.json(stages);
  } catch {
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı" }, { status: 503 });
  }
}
