import { NextResponse } from "next/server";
import { sendCandidateEmail } from "@/modules/communication/service";
import { sendEmailSchema, bulkSendSchema } from "@/modules/communication/schema";
import { logger } from "@/lib/logger";
import { requireAuth, AuthError, authErrorResponse } from "@/lib/api-auth";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = checkRateLimit(`email:${getClientId(request)}`, { limit: 20, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  try {
    await requireAuth(request, "communication:send");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

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
    } catch (err) {
      logger.error("Failed to send bulk email", "api.communication.send", { error: String(err) });
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
  } catch (err) {
    logger.error("Failed to send email", "api.communication.send", { error: String(err) });
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 400 }
    );
  }
}
