import { NextResponse } from "next/server";
import { addQuestion } from "@/modules/assessments/service";
import { createQuestionSchema } from "@/modules/assessments/schema";
import { requireAuth, AuthError, authErrorResponse } from "@/lib/api-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, "assessments:write");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

  const { id } = await params;
  const body = await request.json();

  const parsed = createQuestionSchema.safeParse({
    ...body,
    assessmentId: id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const question = await addQuestion(parsed.data);
    return NextResponse.json(question, { status: 201 });
  } catch (err) {
    console.error("[API] addQuestion error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Soru eklenemedi" },
      { status: 400 }
    );
  }
}
