import { NextResponse } from "next/server";
import { getAssessments } from "@/modules/assessments/queries";
import { createAssessment } from "@/modules/assessments/service";
import { createAssessmentSchema } from "@/modules/assessments/schema";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const assessments = await getAssessments();
    return NextResponse.json(assessments);
  } catch (err) {
    logger.error("Failed to load assessments", "api.assessments.GET", { error: String(err) });
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const assessment = await createAssessment(parsed.data);
    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    logger.error("Failed to create assessment", "api.assessments.POST", { error: String(err) });
    return NextResponse.json({ error: "Test oluşturulamadı" }, { status: 400 });
  }
}
