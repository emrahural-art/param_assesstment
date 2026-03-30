import { NextResponse } from "next/server";
import { getInviteByToken, markInviteStarted } from "@/modules/assessments/invites";
import { startExam, shuffleQuestions } from "@/modules/assessments/service";

export async function POST(
  _request: Request,
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

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Bu linkin süresi dolmuş" }, { status: 410 });
  }

  if (invite.status === "PENDING") {
    await markInviteStarted(token);
    await startExam(invite.candidateId, invite.assessmentId);
  }

  const shuffled = shuffleQuestions(invite.assessment.questions, token);

  const questions = shuffled.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: q.options,
    order: q.order,
    imageUrl: q.imageUrl ?? null,
  }));

  return NextResponse.json({
    questions,
    durationMinutes: invite.assessment.durationMinutes,
    startedAt: invite.startedAt ?? new Date(),
  });
}
