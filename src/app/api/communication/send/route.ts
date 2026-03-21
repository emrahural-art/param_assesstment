import { NextResponse } from "next/server";
import { sendCandidateEmail } from "@/modules/communication/service";
import { sendEmailSchema, bulkSendSchema } from "@/modules/communication/schema";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.candidateIds && Array.isArray(body.candidateIds)) {
    const parsed = bulkSendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    try {
      const results = await Promise.allSettled(
        parsed.data.candidateIds.map((candidateId) =>
          sendCandidateEmail({
            candidateId,
            templateId: parsed.data.templateId,
            subject: parsed.data.subject,
            body: parsed.data.body,
          })
        )
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json({ sent, failed, total: results.length });
    } catch {
      return NextResponse.json(
        { error: "Toplu gönderim başarısız" },
        { status: 400 }
      );
    }
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = await sendCandidateEmail(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 400 }
    );
  }
}
