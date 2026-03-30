import { NextResponse } from "next/server";
import { z } from "zod";
import { getInviteByToken, markInviteCompleted } from "@/modules/assessments/invites";
import { submitExam } from "@/modules/assessments/service";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    }),
  ),
  violations: z
    .array(
      z.object({
        type: z.enum(["tab_switch", "fullscreen_exit", "copy_attempt"]),
        timestamp: z.string(),
      }),
    )
    .optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Geçersiz link" }, { status: 404 });
  }

  if (invite.status === "COMPLETED") {
    return NextResponse.json({ error: "Bu sınav zaten tamamlandı" }, { status: 410 });
  }

  if (invite.status !== "STARTED") {
    return NextResponse.json({ error: "Sınav henüz başlatılmadı" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = submitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const result = await submitExam(
      invite.candidateId,
      invite.assessmentId,
      parsed.data.answers,
      parsed.data.violations,
    );

    await markInviteCompleted(token);

    return NextResponse.json({
      message: "Sınav başarıyla tamamlandı",
      score: result.score,
      totalPoints: result.totalPoints,
      level: result.level,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sınav gönderilemedi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
