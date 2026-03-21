import { NextResponse } from "next/server";
import { submitExam } from "@/modules/assessments/service";
import { submitExamSchema } from "@/modules/assessments/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const parsed = submitExamSchema.safeParse({
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
    const result = await submitExam(
      body.candidateId,
      id,
      parsed.data.answers,
      parsed.data.violations
    );

    return NextResponse.json({
      score: result.score,
      totalPoints: result.totalPoints,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sınav gönderilemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
