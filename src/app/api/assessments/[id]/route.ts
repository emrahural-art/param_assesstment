import { NextResponse } from "next/server";
import { getAssessmentById } from "@/modules/assessments/queries";
import { updateAssessment, deleteAssessment } from "@/modules/assessments/service";
import { logger } from "@/lib/logger";
import { optionalAuth, requireAuth, AuthError, authErrorResponse } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await getAssessmentById(id);

  if (!assessment) {
    return NextResponse.json({ error: "Test bulunamadı" }, { status: 404 });
  }

  const token = await optionalAuth(request);
  if (!token?.sub && assessment.questions) {
    // Strip correctAnswer from public (unauthenticated) responses
    const sanitised = {
      ...assessment,
      questions: assessment.questions.map(({ correctAnswer: _ca, ...q }) => q),
    };
    return NextResponse.json(sanitised);
  }

  return NextResponse.json(assessment);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request, "assessments:write");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request, "assessments:delete");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

  const { id } = await params;

  try {
    await deleteAssessment(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete assessment", "api.assessments.DELETE", { error: String(err) });
    return NextResponse.json({ error: "Test silinemedi" }, { status: 400 });
  }
}
