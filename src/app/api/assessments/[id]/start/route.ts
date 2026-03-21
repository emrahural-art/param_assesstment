import { NextResponse } from "next/server";
import { z } from "zod";
import { startExam } from "@/modules/assessments/service";
import { getAssessmentForExam } from "@/modules/assessments/queries";
import { shuffleQuestions } from "@/modules/assessments/service";

const startSchema = z.object({
  candidateId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const assessment = await getAssessmentForExam(id);
    if (!assessment) {
      return NextResponse.json({ error: "Test bulunamadı" }, { status: 404 });
    }

    const result = await startExam(parsed.data.candidateId, id);

    const questions = shuffleQuestions(
      assessment.questions,
      parsed.data.candidateId + id
    );

    return NextResponse.json({
      resultId: result.id,
      title: assessment.title,
      durationMinutes: assessment.durationMinutes,
      questions,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sınav başlatılamadı";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
