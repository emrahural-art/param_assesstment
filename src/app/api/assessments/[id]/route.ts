import { NextResponse } from "next/server";
import { getAssessmentById } from "@/modules/assessments/queries";
import { updateAssessment, deleteAssessment } from "@/modules/assessments/service";
import { logger } from "@/lib/logger";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await getAssessmentById(id);

  if (!assessment) {
    return NextResponse.json({ error: "Test bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(assessment);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await updateAssessment(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    logger.error("Failed to update assessment", "api.assessments.PUT", { error: String(err) });
    return NextResponse.json({ error: "Test güncellenemedi" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await deleteAssessment(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete assessment", "api.assessments.DELETE", { error: String(err) });
    return NextResponse.json({ error: "Test silinemedi" }, { status: 400 });
  }
}
