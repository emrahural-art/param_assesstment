import { NextResponse } from "next/server";
import { getInviteByToken } from "@/modules/assessments/invites";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş link" }, { status: 404 });
  }

  if (invite.status === "COMPLETED") {
    return NextResponse.json({ error: "Bu sınav zaten tamamlandı" }, { status: 410 });
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Bu linkin süresi dolmuş" }, { status: 410 });
  }

  return NextResponse.json({
    assessment: {
      id: invite.assessment.id,
      title: invite.assessment.title,
      description: invite.assessment.description,
      durationMinutes: invite.assessment.durationMinutes,
      questionCount: invite.assessment.questions.length,
    },
    candidate: {
      firstName: invite.candidate.firstName,
      lastName: invite.candidate.lastName,
    },
    status: invite.status,
    startedAt: invite.startedAt,
  });
}
